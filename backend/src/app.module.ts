import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller'; 
import { AppService } from './app.service';     
import { AuthModule } from './modules/auth/auth.module'; 
import { LocationsModule } from './modules/locations/locations.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { CarsModule } from './modules/cars/cars.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailModule } from './modules/email/email.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ContactModule } from './modules/contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EmailModule,
    AuthModule,
    LocationsModule,
    TenantsModule,
    CarsModule,
    ReservationsModule,
    DashboardModule,
    NotificationsModule,
    PaymentsModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
