/**
 * catalog-svc — NestJS + GraphQL + Prisma.
 *
 * Serves the catalog domain (products, categories) as a GraphQL API.
 * Port: 4001 (default, override with PORT env).
 * GraphQL endpoint: /graphql
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  AllExceptionsFilter,
  LoggingInterceptor,
} from '@server/shared';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for cross-origin requests (e.g., from the shell or gateway).
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Shared cross-cutting concerns (from `@server/shared`).
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Publish an OpenAPI schema at /api-docs (admin/REST fallback).
  const config = new DocumentBuilder()
    .setTitle('Catalog Service')
    .setDescription('Catalog domain API (products, categories).')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = parseInt(process.env.PORT || '4001', 10);
  await app.listen(port);
  Logger.log(`🚀 catalog-svc is running on: http://localhost:${port}/graphql`);
  Logger.log(`📚 OpenAPI docs: http://localhost:${port}/api-docs`);
  Logger.log(`❤️  Health: http://localhost:${port}/health`);
}

bootstrap();
