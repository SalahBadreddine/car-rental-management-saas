import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CarsService } from './cars.service';
import { CreateCarRequestDto, CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StorageService } from '../storage/storage.service';
import type { UploadedFile as R2UploadedFile } from '../storage/storage.service';

@Controller('cars')
export class CarsController {
  constructor(
    private readonly carsService: CarsService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'primaryImage', maxCount: 1 },
      { name: 'galleryImages', maxCount: 10 },
    ]),
  )
  async create(
    @Body() body: CreateCarRequestDto,
    @CurrentUser() user: any,
    @UploadedFiles()
    files?: {
      primaryImage?: R2UploadedFile[];
      galleryImages?: R2UploadedFile[];
    },
  ) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required to create cars.');
    }

    let primaryImageUrl: string | undefined;
    let galleryUrls: string[] = [];

    // Upload primary image
    if (files?.primaryImage?.[0]) {
      const folderPath = `tenants/${user.tenant_id}/cars/primary`;
      primaryImageUrl = await this.storageService.uploadFile(files.primaryImage[0], folderPath);
    }

    // Upload gallery images
    if (files?.galleryImages && files.galleryImages.length > 0) {
      const folderPath = `tenants/${user.tenant_id}/cars/gallery`;
      galleryUrls = await Promise.all(
        files.galleryImages.map((file) => this.storageService.uploadFile(file, folderPath)),
      );
    }

    const createCarDto: CreateCarDto = {
      ...body,
      primaryImageUrl,
      galleryUrls,
    };

    return this.carsService.create(createCarDto, user.tenant_id);
  }

  @Get()
  async findAll(
    @Query('tenantId') tenantId: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.carsService.findAll(tenantId, { category, status, locationId });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.carsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'primaryImage', maxCount: 1 },
      { name: 'galleryImages', maxCount: 10 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCarDto,
    @CurrentUser() user: any,
    @UploadedFiles()
    files?: {
      primaryImage?: R2UploadedFile[];
      galleryImages?: R2UploadedFile[];
    },
  ) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required to update cars.');
    }

    const updateDto: UpdateCarDto = { ...body };

    // Upload new primary image if provided
    if (files?.primaryImage?.[0]) {
      const folderPath = `tenants/${user.tenant_id}/cars/primary`;
      updateDto.primaryImageUrl = await this.storageService.uploadFile(
        files.primaryImage[0],
        folderPath,
      );
    }

    // Upload new gallery images if provided
    if (files?.galleryImages && files.galleryImages.length > 0) {
      const folderPath = `tenants/${user.tenant_id}/cars/gallery`;
      updateDto.galleryUrls = await Promise.all(
        files.galleryImages.map((file) => this.storageService.uploadFile(file, folderPath)),
      );
    }

    return this.carsService.update(id, updateDto, user.tenant_id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required to delete cars.');
    }

    return this.carsService.remove(id, user.tenant_id);
  }

  /**
   * Check car availability for a date range (Public)
   * GET /cars/:id/availability?startDate=...&endDate=...
   */
  @Get(':id/availability')
  async checkAvailability(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate query parameters are required.');
    }

    return this.carsService.checkAvailability(id, startDate, endDate);
  }

  /**
   * Quick status update (Admin only)
   * PATCH /cars/:id/status
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant context is required.');
    }

    return this.carsService.updateStatus(id, status, user.tenant_id);
  }
}
