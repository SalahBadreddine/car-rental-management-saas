import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { SupabaseClientProvider } from '../../common/providers/supabase.provider';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, SupabaseClientProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
