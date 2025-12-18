import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Core Modules
import { PrismaModule } from '../modules/prisma/prisma.module';

// Feature Modules
import { OperationsModule } from '../modules/operations/operations.module';
import { TeamsModule } from '../modules/teams/teams.module';
import { WorkersModule } from '../modules/workers/workers.module';
import { WorkPackagesModule } from '../modules/work-packages/work-packages.module';
import { ReadingsModule } from '../modules/readings/readings.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Core
    PrismaModule,
    
    // Features
    OperationsModule,
    TeamsModule,
    WorkersModule,
    WorkPackagesModule,
    ReadingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
