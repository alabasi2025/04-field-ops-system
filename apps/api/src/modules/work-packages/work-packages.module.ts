import { Module } from '@nestjs/common';
import { WorkPackagesController } from './work-packages.controller';
import { WorkPackagesService } from './work-packages.service';

@Module({
  controllers: [WorkPackagesController],
  providers: [WorkPackagesService],
  exports: [WorkPackagesService],
})
export class WorkPackagesModule {}
