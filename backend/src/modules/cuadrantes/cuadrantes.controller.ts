import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CuadrantesService, AsignarCeldaDto } from './cuadrantes.service';

@ApiTags('Cuadrantes')
@Controller('cuadrantes')
export class CuadrantesController {
  constructor(private readonly cuadrantesService: CuadrantesService) {}

  @Get(':servicioId/:anio/:mes')
  @ApiOperation({ summary: 'Obtener la matriz del cuadrante mensual para un servicio' })
  getMatrizMensual(
    @Param('servicioId') servicioId: string,
    @Param('anio', ParseIntPipe) anio: number,
    @Param('mes', ParseIntPipe) mes: number,
  ) {
    return this.cuadrantesService.getMatrizMensual(servicioId, anio, mes);
  }

  @Post('asignar-celda')
  @ApiOperation({ summary: 'Asignar o editar un turno en una celda (Drag & Drop desde la paleta)' })
  asignarTurnoCelda(@Body() dto: AsignarCeldaDto) {
    return this.cuadrantesService.asignarTurnoCelda(dto);
  }
}
