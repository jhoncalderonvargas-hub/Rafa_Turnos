import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS para admitir el frontend Angular y el dominio de la Intranet
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Prefijo global de API
  app.setGlobalPrefix('api/v1');

  // Validación global estricta de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Documentación OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('Rafa Turnos API')
    .setDescription('API REST Satélite para Programación y Gestión de Turnos Hospitalarios (Referente Thurni)')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Servicios', 'Gestión de servicios asistenciales y coberturas mínimas')
    .addTag('Empleados', 'Directorio de colaboradores y sincronización con la Intranet')
    .addTag('Turnos', 'Catálogo de tipos de turno y franjas horarias')
    .addTag('Cuadrantes', 'Matriz de cuadrantes mensuales y asignaciones con Drag & Drop')
    .addTag('Reglas', 'Motor de validación de descansos (12h, post-guardia) y Ley 2101')
    .addTag('Reportes', 'Reporte consolidado de nómina en Excel y suscripción móvil iCalendar')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🏥 Rafa Turnos API ejecutándose en: http://localhost:${port}/api/v1`);
  console.log(`📚 Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();
