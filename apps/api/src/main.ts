import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS настройки для production и development
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigins = frontendUrl
    ? [frontendUrl, 'http://localhost:3000', 'http://localhost:3002']
    : ['http://localhost:3000', 'http://localhost:3002'];
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.use(cookieParser());
  await app.listen(process.env.PORT || 3001);
  console.log(`🚀 API server is running on http://localhost:${process.env.PORT || 3001}`);
  if (frontendUrl) {
    console.log(`✅ CORS enabled for: ${frontendUrl}`);
  }
}
bootstrap();





