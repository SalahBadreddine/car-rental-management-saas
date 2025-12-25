import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';
import { SupabaseClientProvider } from '../../common/providers/supabase.provider';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Module({
  imports: [NotificationsModule, AuthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, SupabaseClientProvider, JwtAuthGuard],
  exports: [PaymentsService],
})
export class PaymentsModule {}
