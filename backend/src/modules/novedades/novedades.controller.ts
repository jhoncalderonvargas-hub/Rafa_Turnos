import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NovedadesService, CreateNovedadDto } from './novedades.service';

@ApiTags('Novedades')
@Controller('novedades')
export class NovedadesController {
  constructor(private readonly novedadesService: NovedadesService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar novedad de ausencia (VAC, INC, Licencia) y bloquear celdas del cuadrante automáticamente',
  })
  create(@Body() dto: CreateNovedadDto) {
    return this.novedadesService.create(dto);
  }

  @Get('empleado/:empleadoId')
  @ApiOperation({ summary: 'Listar novedades activas de un colaborador' })
  findByEmpleado(@Param('empleadoId') empleadoId: string) {
    return this.novedadesService.findByEmpleado(empleadoId);
  }

  @Get('rango')
  @ApiOperation({ summary: 'Consultar novedades activas en un rango de fechas (para bloqueo de cuadrante)' })
  @ApiQuery({ name: 'desde', type: String, example: '2026-08-01' })
  @ApiQuery({ name: 'hasta', type: String, example: '2026-08-31' })
  findActivasEnRango(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.novedadesService.findActivasEnRango(desde, hasta);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar / anular una novedad registrada' })
  cancelar(@Param('id') id: string) {
    return this.novedadesService.cancelar(id);
  }
}
