import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestInterceptors } from './common/interceptors/request.interceptor';

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

  await app.listen(3000);
}
bootstrap();
