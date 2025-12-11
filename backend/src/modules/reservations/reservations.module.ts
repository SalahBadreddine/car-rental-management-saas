import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseClientProvider } from '../../common/providers/supabase.provider';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  imports: [AuthModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, SupabaseClientProvider, JwtAuthGuard],
  exports: [ReservationsService],
})
export class ReservationsModule {}
