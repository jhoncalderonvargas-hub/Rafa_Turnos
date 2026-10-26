import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera el libro Excel de reporte para Nómina en dos pestañas:
   * 1. Resumen_Nomina (Consolidado de horas por tipo de recargo)
   * 2. Cuadrante_Extendido (Detalle día a día 1..31)
   */
  async exportarReporteNominaExcel(anio: number, mes: number): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Rafa Turnos Hospitalario';
    workbook.created = new Date();

    // ----------------------------------------------------
    // HOJA 1: RESUMEN_NOMINA
    // ----------------------------------------------------
    const sheetResumen = workbook.addWorksheet('Resumen_Nomina');

    sheetResumen.columns = [
      { header: 'CÉDULA', key: 'documento', width: 16 },
      { header: 'COLABORADOR', key: 'nombre', width: 32 },
      { header: 'CARGO', key: 'cargo', width: 25 },
      { header: 'SERVICIO BASE', key: 'servicio', width: 25 },
      { header: 'HOD (Ord. Diurnas)', key: 'hod', width: 18 },
      { header: 'HON (Ord. Nocturnas +35%)', key: 'hon', width: 24 },
      { header: 'HDFD (Fest. Diurnas +75%)', key: 'hdfd', width: 24 },
      { header: 'HDFN (Fest. Nocturnas +110%)', key: 'hdfn', width: 26 },
      { header: 'HED (Extras Diurnas)', key: 'hed', width: 20 },
      { header: 'HEN (Extras Nocturnas)', key: 'hen', width: 22 },
      { header: 'TOTAL HORAS', key: 'totalHoras', width: 16 },
    ];

    // Estilo encabezados
    sheetResumen.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheetResumen.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0284C7' }, // Azul clínico
    };

    // Consulta todos los colaboradores y sus asignaciones del mes
    const empleados = await this.prisma.empleado.findMany({
      where: { activo: true },
      include: {
        categoria: true,
        servicioBase: true,
        asignaciones: {
          where: {
            cuadrante: { anio, mes },
          },
          include: { turno: true },
        },
      },
      orderBy: { apellidos: 'asc' },
    });

    for (const emp of empleados) {
      let hod = 0, hon = 0, hdfd = 0, hdfn = 0, hed = 0, hen = 0;

      for (const asig of emp.asignaciones) {
        hod += Number(asig.horasOrdinariasDiurnas);
        hon += Number(asig.horasOrdinariasNocturnas);
        hdfd += Number(asig.horasDominicalesDiurnas);
        hdfn += Number(asig.horasDominicalesNocturnas);
        hed += Number(asig.horasExtrasDiurnas);
        hen += Number(asig.horasExtrasNocturnas);
      }

      const totalHoras = hod + hon + hdfd + hdfn + hed + hen;

      sheetResumen.addRow({
        documento: emp.numeroDocumento,
        nombre: `${emp.apellidos} ${emp.nombres}`,
        cargo: emp.categoria.nombre,
        servicio: emp.servicioBase.nombre,
        hod,
        hon,
        hdfd,
        hdfn,
        hed,
        hen,
        totalHoras,
      });
    }

    // ----------------------------------------------------
    // HOJA 2: CUADRANTE_EXTENDIDO (DÍA A DÍA 1..31)
    // ----------------------------------------------------
    const sheetExtendido = workbook.addWorksheet('Cuadrante_Extendido_Detallado');
    const diasEnMes = new Date(anio, mes, 0).getDate();

    const columnasExtendido: Partial<ExcelJS.Column>[] = [
      { header: 'CÉDULA', key: 'documento', width: 15 },
      { header: 'COLABORADOR', key: 'nombre', width: 28 },
      { header: 'SERVICIO', key: 'servicio', width: 20 },
    ];

    for (let d = 1; d <= diasEnMes; d++) {
      columnasExtendido.push({
        header: d.toString().padStart(2, '0'),
        key: `dia_${d}`,
        width: 6,
      });
    }

    sheetExtendido.columns = columnasExtendido;
    sheetExtendido.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheetExtendido.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F766E' }, // Verde esmeralda clínico
    };

    for (const emp of empleados) {
      const fila: any = {
        documento: emp.numeroDocumento,
        nombre: `${emp.apellidos} ${emp.nombres}`,
        servicio: emp.servicioBase.nombre,
      };

      for (let d = 1; d <= diasEnMes; d++) {
        const asig = emp.asignaciones.find(
          (a) => new Date(a.fecha).getDate() === d,
        );
        fila[`dia_${d}`] = asig ? asig.turno.codigo : '-';
      }

      sheetExtendido.addRow(fila);
    }

    return workbook.xlsx.writeBuffer();
  }
}
