import { Module } from '@nestjs/common';
import { CuadrantesService } from './cuadrantes.service';
import { CuadrantesController } from './cuadrantes.controller';
import { ReglasModule } from '../reglas/reglas.module';

@Module({
  imports: [ReglasModule],
  controllers: [CuadrantesController],
  providers: [CuadrantesService],
  exports: [CuadrantesService],
})
export class CuadrantesModule {}
