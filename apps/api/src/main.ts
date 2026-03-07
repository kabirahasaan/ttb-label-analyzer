import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { getConfig } from '@ttb/config';
import { ApplicationService } from './app/modules/application/application.service';

async function bootstrap() {
  const config = getConfig();
  const app = await NestFactory.create(AppModule);

  // Seed test data in development
  const applicationService = app.get(ApplicationService);
  applicationService.seedTestData();

  app.enableCors({
    origin: config.getConfig().api.corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TTB Label Compliance API')
    .setDescription('API for validating alcohol beverage labels against TTB regulations')
    .setVersion('1.0.0')
    .addTag('health', 'Health check endpoints')
    .addTag('labels', 'Label operations')
    .addTag('applications', 'COLA application operations')
    .addTag('validation', 'Validation operations')
    .addTag('batch', 'Batch processing')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.getApiPort();
  const host = config.getApiHost();

  await app.listen(port, host, () => {
    console.log(`🚀 Server running on ${host}:${port}`);
    console.log(`📚 API Documentation: http://${host}:${port}/api/docs`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
