/**
 * نظام العمليات الميدانية - Field Operations System
 * API Server - Port 3004
 */
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);
  
  // CORS
  app.enableCors({
    origin: ['http://localhost:4204', 'http://localhost:4200'],
    credentials: true,
  });
  
  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('نظام العمليات الميدانية')
    .setDescription('Field Operations System API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('operations', 'العمليات الميدانية')
    .addTag('teams', 'الفرق الميدانية')
    .addTag('workers', 'العاملين الميدانيين')
    .addTag('inspections', 'الفحوصات')
    .addTag('work-packages', 'حزم العمل')
    .addTag('readings', 'جولات القراءة')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Start server
  const port = process.env.API_PORT || 3004;
  await app.listen(port);
  
  Logger.log(
    `🚀 Field Operations API is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `📚 Swagger Documentation: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
