import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EmpleadosService } from './empleados.service';

@ApiTags('Empleados')
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar empleados activos (con opción de filtrar por servicio base)' })
  @ApiQuery({ name: 'servicioId', required: false, type: String })
  findAll(@Query('servicioId') servicioId?: string) {
    return this.empleadosService.findAll(servicioId);
  }

  @Get('candidatos-rotacion/:servicioId')
  @ApiOperation({ summary: 'Obtener colaboradores del servicio base + homólogos autorizados para rotar' })
  findCandidatosParaServicio(@Param('servicioId') servicioId: string) {
    return this.empleadosService.findCandidatosParaServicio(servicioId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar ficha de un colaborador' })
  findOne(@Param('id') id: string) {
    return this.empleadosService.findOne(id);
  }
}
