import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipoNovedad } from '@prisma/client';

export interface CreateNovedadDto {
  empleadoId: string;
  tipo: TipoNovedad;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;    // YYYY-MM-DD
  descripcion?: string;
  aprobadoPor?: string;
}

@Injectable()
export class NovedadesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra una novedad (INC, VAC, licencia, etc.) y bloquea
   * automáticamente las celdas del cuadrante del periodo afectado.
   */
  async create(dto: CreateNovedadDto) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: dto.empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado ${dto.empleadoId} no encontrado`);
    }

    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);

    // Verificar si ya hay una novedad activa en el periodo que se solapa
    const solapamiento = await this.prisma.novedadAusencia.findFirst({
      where: {
        empleadoId: dto.empleadoId,
        activo: true,
        AND: [
          { fechaInicio: { lte: fechaFin } },
          { fechaFin: { gte: fechaInicio } },
        ],
      },
    });

    if (solapamiento) {
      throw new ConflictException(
        `El empleado ya tiene una novedad activa (${solapamiento.tipo}) que se solapa del ${solapamiento.fechaInicio.toISOString().split('T')[0]} al ${solapamiento.fechaFin.toISOString().split('T')[0]}`
      );
    }

    const novedad = await this.prisma.novedadAusencia.create({
      data: {
        empleadoId: dto.empleadoId,
        tipo: dto.tipo,
        fechaInicio,
        fechaFin,
        descripcion: dto.descripcion,
        aprobadoPor: dto.aprobadoPor,
        activo: true,
      },
      include: { empleado: { include: { categoria: true, servicioBase: true } } },
    });

    // Bloquear celdas del cuadrante: insertar o actualizar las asignaciones
    // del periodo con el código de la novedad (INC o VAC)
    const codigoTurno = dto.tipo === TipoNovedad.VACACIONES ? 'VAC' : 'INC';
    const turnoBloqueo = await this.prisma.tipoTurno.findUnique({
      where: { codigo: codigoTurno },
    });

    if (turnoBloqueo) {
      // Buscar cuadrantes activos del servicio base del empleado en el rango
      const fechaInicioMes = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
      const fechaFinMes = new Date(fechaFin.getFullYear(), fechaFin.getMonth() + 1, 0);

      const cuadrantes = await this.prisma.cuadrante.findMany({
        where: {
          servicioId: empleado.servicioBaseId,
          estado: { notIn: ['CERRADO_NOMINA'] },
          OR: [
            {
              anio: { gte: fechaInicioMes.getFullYear() },
            },
          ],
        },
      });

      for (const cuadrante of cuadrantes) {
        // Iterar por cada día del rango dentro del mes del cuadrante
        const cursor = new Date(fechaInicio);
        while (cursor <= fechaFin) {
          if (
            cursor.getFullYear() === cuadrante.anio &&
            cursor.getMonth() + 1 === cuadrante.mes
          ) {
            await this.prisma.asignacionTurno.upsert({
              where: {
                un_turno_por_empleado_y_dia: {
                  empleadoId: dto.empleadoId,
                  fecha: new Date(cursor),
                },
              },
              update: {
                turnoId: turnoBloqueo.id,
                servicioEjecutorId: empleado.servicioBaseId,
                esPlanificado: false,
              },
              create: {
                empleadoId: dto.empleadoId,
                cuadranteId: cuadrante.id,
                turnoId: turnoBloqueo.id,
                servicioEjecutorId: empleado.servicioBaseId,
                fecha: new Date(cursor),
                esPlanificado: false,
                esRefuerzo: false,
                esRotacion: false,
              },
            });
          }
          cursor.setDate(cursor.getDate() + 1);
        }
      }
    }

    return novedad;
  }

  async findByEmpleado(empleadoId: string) {
    return this.prisma.novedadAusencia.findMany({
      where: { empleadoId, activo: true },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  /**
   * Consulta las novedades activas para un rango de fechas determinado.
   * Útil para que el cuadrante sepa qué celdas están bloqueadas.
   */
  async findActivasEnRango(desde: string, hasta: string) {
    return this.prisma.novedadAusencia.findMany({
      where: {
        activo: true,
        fechaInicio: { lte: new Date(hasta) },
        fechaFin: { gte: new Date(desde) },
      },
      include: {
        empleado: {
          include: { categoria: true, servicioBase: true },
        },
      },
      orderBy: { fechaInicio: 'asc' },
    });
  }

  async cancelar(id: string) {
    const novedad = await this.prisma.novedadAusencia.findUnique({ where: { id } });
    if (!novedad) throw new NotFoundException(`Novedad ${id} no encontrada`);

    return this.prisma.novedadAusencia.update({
      where: { id },
      data: { activo: false },
    });
  }
}
