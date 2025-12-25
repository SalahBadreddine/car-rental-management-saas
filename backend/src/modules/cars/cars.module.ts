import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { SupabaseClientProvider } from '../../common/providers/supabase.provider';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  imports: [StorageModule, AuthModule],
  controllers: [CarsController],
  providers: [CarsService, SupabaseClientProvider, JwtAuthGuard],
  exports: [CarsService],
})
export class CarsModule {}
