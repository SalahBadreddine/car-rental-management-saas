import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller'; 
import { AppService } from './app.service';     
import { AuthModule } from './modules/auth/auth.module'; 
import { LocationsModule } from './modules/locations/locations.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { CarsModule } from './modules/cars/cars.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    LocationsModule,
    TenantsModule,
    CarsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}