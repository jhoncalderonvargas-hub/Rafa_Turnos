import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ServiciosService, CreateServicioDto, SetCoberturaDto } from './servicios.service';

@ApiTags('Servicios')
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los servicios hospitalarios' })
  @ApiQuery({ name: 'incluirInactivos', required: false, type: Boolean })
  findAll(@Query('incluirInactivos') incluirInactivos?: boolean) {
    return this.serviciosService.findAll(incluirInactivos);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de un servicio con su plantilla base y requerimientos' })
  findOne(@Param('id') id: string) {
    return this.serviciosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo servicio hospitalario' })
  create(@Body() dto: CreateServicioDto) {
    return this.serviciosService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de un servicio' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateServicioDto>) {
    return this.serviciosService.update(id, dto);
  }

  @Patch(':id/toggle-activo')
  @ApiOperation({ summary: 'Activar o desactivar un servicio sin eliminar histórico' })
  toggleActivo(@Param('id') id: string) {
    return this.serviciosService.toggleActivo(id);
  }

  @Post(':id/coberturas')
  @ApiOperation({ summary: 'Configurar o actualizar la dotación mínima de un turno para el servicio' })
  setCobertura(@Param('id') id: string, @Body() dto: SetCoberturaDto) {
    return this.serviciosService.setCobertura(id, dto);
  }

  @Get('tipo-asistencia/:tipo')
  @ApiOperation({ summary: 'Listar servicios homólogos por afinidad asistencial' })
  findHomologos(@Param('tipo') tipo: string) {
    return this.serviciosService.findHomologos(tipo);
  }
}
