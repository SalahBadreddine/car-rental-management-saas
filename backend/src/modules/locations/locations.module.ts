import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { SupabaseClientProvider } from '../../common/providers/supabase.provider';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  imports: [StorageModule, AuthModule],
  controllers: [LocationsController],
  providers: [LocationsService, SupabaseClientProvider, JwtAuthGuard],
  exports: [LocationsService],
})
export class LocationsModule {}

