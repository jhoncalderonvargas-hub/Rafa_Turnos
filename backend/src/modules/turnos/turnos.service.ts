import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TurnosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tipoTurno.findMany({
      where: { activo: true },
      orderBy: { codigo: 'asc' },
    });
  }

  async findByCodigo(codigo: string) {
    return this.prisma.tipoTurno.findUnique({
      where: { codigo },
    });
  }
}
