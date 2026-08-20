import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logs } from './loggers/loggers.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PromGatewayService } from './prom-gateway/prom-gateway.service';
import { MetricsInterceptor } from './metricsintercector/metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = app.get(Logs);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  // trust nginx as reverse proxy so req.ip reflects the real client IP
  // (X-Real-IP / X-Forwarded-For), not the nginx container address
  app.set('trust proxy', 1);

  // register global metrics interceptor
  const promService = app.get(PromGatewayService);
  app.useGlobalInterceptors(new MetricsInterceptor(promService))

  if (process.env.NODE_ENV !== 'prod') app.useLogger(logger);

  const config = new DocumentBuilder()
    .setTitle('Fake Vinted Documentation')
    .setVersion('0.1')
    .setDescription('')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/vinted/docs', app, document);

  await app.listen(port, () => {
    logger.log(`Server starting at port: ${port}`);
  });
}

bootstrap();
