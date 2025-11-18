import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestInterceptors } from './common/interceptors/request.interceptor';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Female Daily API Test')
    .setDescription('API documentation for product service')
    .setVersion('1.0')
    .addApiKey(
      { type: 'apiKey', name: 'authorization', in: 'header' },
      'custom-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.useGlobalInterceptors(new ResponseInterceptor(), new RequestInterceptors);
  
  app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors) => {
    return new BadRequestException(
      errors.map(err => ({
        field: err.property,
        constraints: err.constraints,
      }))
    );
  }
}));


  await app.listen(3000);
}
bootstrap();
