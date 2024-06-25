import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder()
    .setTitle('Fivly API')
    .setDescription("Fivly API to manage 1901's law association in France.")
    .setVersion('1.0')
    .addTag('fivly')
    .build();

  dotenv.config();

  // Utilisation du middleware pour obtenir le corps brut seulement pour les webhooks Stripe
  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
