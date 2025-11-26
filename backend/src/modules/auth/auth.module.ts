import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseClientProvider } from '../../common/providers/supabase.provider';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SupabaseClientProvider],
  exports: [AuthService],
})
export class AuthModule {}