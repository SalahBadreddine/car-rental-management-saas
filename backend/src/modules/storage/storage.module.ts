import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';

@Module({
  providers: [StorageService],
  exports: [StorageService], // Exporting so Locations can use it
})
export class StorageModule {}