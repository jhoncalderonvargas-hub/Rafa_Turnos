import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmpleadosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(servicioId?: string) {
    return this.prisma.empleado.findMany({
      where: {
        activo: true,
        ...(servicioId ? { servicioBaseId: servicioId } : {}),
      },
      include: {
        categoria: true,
        servicioBase: true,
      },
      orderBy: { apellidos: 'asc' },
    });
  }

  async findOne(id: string) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id },
      include: {
        categoria: true,
        servicioBase: true,
        tokensCalendario: { where: { activo: true } },
      },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return empleado;
  }

  /**
   * Obtiene candidatos disponibles para un servicio y turno específico:
   * 1. Colaboradores de la base del servicio.
   * 2. Colaboradores de otros servicios que tengan el mismo tipoAsistencia (rotación homóloga).
   */
  async findCandidatosParaServicio(servicioId: string) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id: servicioId },
    });

    if (!servicio) {
      throw new NotFoundException(`Servicio ${servicioId} no encontrado`);
    }

    // Busca todos los colaboradores de este servicio o de servicios con la misma afinidad
    return this.prisma.empleado.findMany({
      where: {
        activo: true,
        servicioBase: {
          tipoAsistencia: servicio.tipoAsistencia,
        },
      },
      include: {
        categoria: true,
        servicioBase: true,
      },
      orderBy: [{ servicioBaseId: 'asc' }, { apellidos: 'asc' }],
    });
  }
}
