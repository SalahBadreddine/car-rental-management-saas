import { Controller, Get, Query, UseGuards, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CarsService } from './cars.services';
import { SearchCarsDto } from './dto/search-cars.dto';
import { FeaturedCarsDto } from './dto/featured-cars.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard) // optional if search is public; remove if public
  async search(
    @Query() dto: SearchCarsDto,
    @CurrentUser() user: any, // gets the current logged-in user
  ) {
  // Use the tenant_id from the logged-in user if not provided in query
  if (!dto.tenantId) {
    if (!user?.tenant_id) {
      throw new BadRequestException('Tenant ID is required');
    }
    dto.tenantId = user.tenant_id;
  }

  return this.carsService.search(dto);
}


  @Get()
  async findAll(@Query('tenantId') tenantId: string) {
    return this.carsService.findAll(tenantId);
  }

  @Get('featured')
  async getFeatured(@Query() query: FeaturedCarsDto) {
    return this.carsService.getFeatured(query);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@CurrentUser() user: any) {
    if (user.role !== 'client_admin') {
      throw new ForbiddenException('Access denied: Admins only');
    }
    return this.carsService.getStatistics(user.tenant_id);
  }
}