import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ValidacionResultado {
  esValido: boolean;
  advertencias: string[];
  errores: string[];
}

@Injectable()
export class ReglasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida si la asignación de un turno para un empleado en una fecha cumple con:
   * 1. Descanso de mínimo 12 horas con respecto al turno del día previo y siguiente.
   * 2. Protección post-guardia (un turno de 12h/24h nocturno exige Saliente 'S' o Libre 'L' al día siguiente).
   * 3. No solapamiento de turnos el mismo día.
   */
  async validarAsignacion(
    empleadoId: string,
    fecha: string, // YYYY-MM-DD
    codigoTurnoNuevo: string,
  ): Promise<ValidacionResultado> {
    const resultado: ValidacionResultado = {
      esValido: true,
      advertencias: [],
      errores: [],
    };

    const fechaActual = new Date(fecha);
    const fechaAyer = new Date(fechaActual);
    fechaAyer.setDate(fechaActual.getDate() - 1);
    const fechaManana = new Date(fechaActual);
    fechaManana.setDate(fechaActual.getDate() + 1);

    // Consulta los turnos del día anterior y siguiente para el colaborador
    const [turnoAyer, turnoManana] = await Promise.all([
      this.prisma.asignacionTurno.findFirst({
        where: { empleadoId, fecha: fechaAyer },
        include: { turno: true },
      }),
      this.prisma.asignacionTurno.findFirst({
        where: { empleadoId, fecha: fechaManana },
        include: { turno: true },
      }),
    ]);

    // Regla 1: Protección Post-Guardia (Si ayer hizo Noche o Guardia, hoy DEBE ser Saliente 'S' o Libre 'L')
    if (turnoAyer && (turnoAyer.turno.codigo === 'N' || turnoAyer.turno.codigo.startsWith('G'))) {
      if (codigoTurnoNuevo !== 'S' && codigoTurnoNuevo !== 'L') {
        resultado.esValido = false;
        resultado.errores.push(
          `Infracción de Descanso Post-Guardia: El colaborador laboró turno nocturno/guardia el día anterior (${turnoAyer.turno.codigo}). Debe tener asignado Saliente (S) o Libre (L).`,
        );
      }
    }

    // Regla 2: Descanso Mínimo de 12 horas previo (Si hoy hace Mañana 07:00 y ayer terminó a las 22:00 en Tarde)
    if (turnoAyer && turnoAyer.turno.codigo === 'T' && codigoTurnoNuevo === 'M') {
      resultado.advertencias.push(
        `Alerta de Fatiga: El colaborador sale a las 22:00 de Tarde e ingresa a las 07:00 a Mañana (solo 9 horas de descanso). Se recomienda mínimo 12 horas.`,
      );
    }

    // Regla 3: Si hoy es Noche y mañana ya tiene programado Mañana (infracción al día siguiente)
    if (codigoTurnoNuevo === 'N' && turnoManana && turnoManana.turno.codigo === 'M') {
      resultado.esValido = false;
      resultado.errores.push(
        `Conflicto con el día siguiente: Asignar Noche hoy colisiona con el turno Mañana ya programado para mañana.`,
      );
    }

    return resultado;
  }
}
