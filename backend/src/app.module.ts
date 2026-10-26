import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ServiciosModule } from './modules/servicios/servicios.module';
import { EmpleadosModule } from './modules/empleados/empleados.module';
import { TurnosModule } from './modules/turnos/turnos.module';
import { CuadrantesModule } from './modules/cuadrantes/cuadrantes.module';
import { ReglasModule } from './modules/reglas/reglas.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { NovedadesModule } from './modules/novedades/novedades.module';
import { IntranetModule } from './modules/intranet/intranet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    AuthModule,
    ServiciosModule,
    EmpleadosModule,
    TurnosModule,
    CuadrantesModule,
    ReglasModule,
    ReportesModule,
    NovedadesModule,
    IntranetModule,
  ],
})
export class AppModule {}
