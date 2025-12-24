import { Module } from '@nestjs/common';
import { CarsService } from './cars.services';
import { CarsController } from './cars.controller';
import { SupabaseClientProvider } from '../../common/providers/supabase.provider';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [AuthModule], 
  controllers: [CarsController],
  providers: [CarsService, SupabaseClientProvider],
  exports: [CarsService],
})
export class CarsModule {}