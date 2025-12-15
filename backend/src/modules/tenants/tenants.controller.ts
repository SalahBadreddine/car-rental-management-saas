import { Controller, Get, Param, Patch, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Post } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantsService } from './tenants.service';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StorageService } from '../storage/storage.service';
import type { UploadedFile as R2UploadedFile } from '../storage/storage.service';

@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: R2UploadedFile,
  ) {
    return this.tenantsService.create(createTenantDto, user.id, file);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.tenantsService.findAll();
  }

  @Get('by-slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<TenantResponseDto> {
    return this.tenantsService.findBySlug(slug);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyTenant(@CurrentUser() user: any) {
    if (!user?.tenant_id) {
      throw new BadRequestException('User does not have a tenant associated');
    }

    return this.tenantsService.findOne(user.tenant_id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateMyTenant(
    @CurrentUser() user: any,
    @Body() updateTenantDto: UpdateTenantDto,
    @UploadedFile() file?: R2UploadedFile,
  ) {
    if (!user?.tenant_id) {
      throw new BadRequestException('User does not have a tenant associated');
    }

    // If a logo file is uploaded, delete the old logo first, then upload the new one
    if (file) {
      // Get current tenant to find existing logo
      const currentTenant = await this.tenantsService.findOne(user.tenant_id);
      
      // Delete old logo if it exists
      if (currentTenant?.logo_url) {
        await this.storageService.deleteFile(currentTenant.logo_url);
      }

      // Upload new logo
      const folderPath = `tenants/${user.tenant_id}/branding`;
      const logoUrl = await this.storageService.uploadFile(file, folderPath);
      updateTenantDto.logoUrl = logoUrl;
    }

    return this.tenantsService.update(user.tenant_id, updateTenantDto);
  }
}
