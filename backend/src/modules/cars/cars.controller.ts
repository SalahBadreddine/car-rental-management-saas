import { Controller, Get, Query } from '@nestjs/common';
import { CarsService } from './cars.services';
import { SearchCarsDto } from './dto/search-cars.dto';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get('search')
  async search(@Query() query: SearchCarsDto) {
    return this.carsService.search(query);
  }

  @Get()
  async findAll(@Query('tenantId') tenantId: string) {
    return this.carsService.findAll(tenantId);
  }
}