import { Controller, Get, Param, Res, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportesService } from './reportes.service';

@ApiTags('Reportes')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('nomina-excel/:anio/:mes')
  @ApiOperation({ summary: 'Descargar el reporte consolidado de horas y recargos para Nómina en Excel (.xlsx)' })
  async exportarNominaExcel(
    @Param('anio', ParseIntPipe) anio: number,
    @Param('mes', ParseIntPipe) mes: number,
    @Res() res: Response,
  ) {
    const buffer = await this.reportesService.exportarReporteNominaExcel(anio, mes);

    const filename = `Reporte_Nomina_Hospital_${anio}_${mes.toString().padStart(2, '0')}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.byteLength,
    });

    res.end(buffer);
  }
}
