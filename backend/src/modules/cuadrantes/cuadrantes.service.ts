import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReglasService } from '../reglas/reglas.service';

export interface AsignarCeldaDto {
  cuadranteId: string;
  empleadoId: string;
  turnoCodigo: string;
  fecha: string; // YYYY-MM-DD
  servicioEjecutorId: string;
  actorId: string; // Quien realiza el Drag & Drop
}

@Injectable()
export class CuadrantesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reglasService: ReglasService,
  ) {}

  /**
   * Obtiene la matriz completa del cuadrante mensual de un servicio:
   * Retorna el cuadrante, los días del mes, los colaboradores adscritos y sus turnos asignados.
   */
  async getMatrizMensual(servicioId: string, anio: number, mes: number) {
    let cuadrante = await this.prisma.cuadrante.findUnique({
      where: {
        cuadrante_unico_servicio_periodo: { servicioId, anio, mes },
      },
      include: {
        servicio: true,
        asignaciones: {
          include: {
            turno: true,
            empleado: {
              include: { categoria: true },
            },
            servicioEjecutor: true,
          },
        },
      },
    });

    // Si el cuadrante aún no existe, se inicializa en estado BORRADOR
    if (!cuadrante) {
      cuadrante = await this.prisma.cuadrante.create({
        data: {
          servicioId,
          anio,
          mes,
          estado: 'BORRADOR',
        },
        include: {
          servicio: true,
          asignaciones: {
            include: {
              turno: true,
              empleado: {
                include: { categoria: true },
              },
              servicioEjecutor: true,
            },
          },
        },
      });
    }

    return cuadrante;
  }

  /**
   * Asignación de turno mediante Drag & Drop desde la paleta de turnos.
   */
  async asignarTurnoCelda(dto: AsignarCeldaDto) {
    const turno = await this.prisma.tipoTurno.findUnique({
      where: { codigo: dto.turnoCodigo },
    });

    if (!turno) {
      throw new NotFoundException(`Tipo de turno '${dto.turnoCodigo}' no existe`);
    }

    // Validación preventiva de descansos con el motor de reglas clínicas
    const validacion = await this.reglasService.validarAsignacion(
      dto.empleadoId,
      dto.fecha,
      dto.turnoCodigo,
    );

    const fechaDate = new Date(dto.fecha);

    // Consulta el empleado para saber si es rotación externa respecto a su base
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: dto.empleadoId },
    });

    const esRotacion = empleado.servicioBaseId !== dto.servicioEjecutorId;

    // Guarda o actualiza la celda en la base de datos (UPSERT)
    const asignacion = await this.prisma.asignacionTurno.upsert({
      where: {
        un_turno_por_empleado_y_dia: {
          empleadoId: dto.empleadoId,
          fecha: fechaDate,
        },
      },
      update: {
        turnoId: turno.id,
        cuadranteId: dto.cuadranteId,
        servicioEjecutorId: dto.servicioEjecutorId,
        esRotacion,
        esPlanificado: false,
      },
      create: {
        empleadoId: dto.empleadoId,
        cuadranteId: dto.cuadranteId,
        turnoId: turno.id,
        servicioEjecutorId: dto.servicioEjecutorId,
        fecha: fechaDate,
        esRotacion,
        esPlanificado: true,
      },
      include: {
        turno: true,
        empleado: true,
      },
    });

    return {
      asignacion,
      validacion,
    };
  }
}
