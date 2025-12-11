import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { SupabaseClientProvider } from '../../common/providers/supabase.provider';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [TenantsController],
  providers: [TenantsService, SupabaseClientProvider, JwtAuthGuard],
  exports: [TenantsService],
})
export class TenantsModule {}

