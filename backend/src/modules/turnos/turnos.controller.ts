import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TurnosService } from './turnos.service';

@ApiTags('Turnos')
@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener el catálogo completo de turnos para la paleta cromática' })
  findAll() {
    return this.turnosService.findAll();
  }

  @Get(':codigo')
  @ApiOperation({ summary: 'Consultar información de un turno por su código (M, T, N, etc.)' })
  findByCodigo(@Param('codigo') codigo: string) {
    return this.turnosService.findByCodigo(codigo);
  }
}
