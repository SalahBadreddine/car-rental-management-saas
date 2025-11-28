import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LocationsService } from './locations.service';
import { CreateLocationDto, CreateLocationRequestDto } from './dto/create-location.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StorageService } from '../storage/storage.service';
import type { UploadedFile as R2UploadedFile } from '../storage/storage.service';

@Controller('locations')
export class LocationsController {
  constructor(
    private readonly locationsService: LocationsService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() body: CreateLocationRequestDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: R2UploadedFile,
  ) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required to create locations.');
    }

    if (!file) {
      throw new BadRequestException('Location image file is required.');
    }

    const folderPath = `tenants/${user.tenant_id}/locations`;
    const imageUrl = await this.storageService.uploadFile(file, folderPath);
    const createLocationDto: CreateLocationDto = {
      ...body,
      imageUrl,
    };

    return this.locationsService.create(createLocationDto, user.tenant_id);
  }

  @Get()
  async findAll(@Query('tenantId') tenantId: string) {
    return this.locationsService.findAll(tenantId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required to delete locations.');
    }

    return this.locationsService.remove(id, user.tenant_id);
  }
}

