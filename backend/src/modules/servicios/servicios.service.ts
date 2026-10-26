import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipoDia } from '@prisma/client';

export interface CreateServicioDto {
  codigo: string;
  nombre: string;
  tipoAsistencia: string;
  ubicacionPiso?: string;
  intranetId?: string;
}

export interface SetCoberturaDto {
  turnoId: string;
  categoriaId: string;
  tipoDia: TipoDia;
  cantidadMinima: number;
}

@Injectable()
export class ServiciosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(incluirInactivos = false) {
    return this.prisma.servicio.findMany({
      where: incluirInactivos ? {} : { activo: true },
      include: {
        requerimientos: {
          include: { turno: true, categoria: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { id },
      include: {
        empleadosBase: {
          include: { categoria: true },
        },
        requerimientos: {
          include: { turno: true, categoria: true },
        },
      },
    });

    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }

    return servicio;
  }

  async create(dto: CreateServicioDto) {
    const existe = await this.prisma.servicio.findUnique({
      where: { codigo: dto.codigo },
    });

    if (existe) {
      throw new ConflictException(`Ya existe un servicio con el código '${dto.codigo}'`);
    }

    return this.prisma.servicio.create({
      data: dto,
    });
  }

  async update(id: string, dto: Partial<CreateServicioDto>) {
    await this.findOne(id);
    return this.prisma.servicio.update({
      where: { id },
      data: dto,
    });
  }

  async toggleActivo(id: string) {
    const servicio = await this.findOne(id);
    return this.prisma.servicio.update({
      where: { id },
      data: { activo: !servicio.activo },
    });
  }

  async setCobertura(servicioId: string, dto: SetCoberturaDto) {
    await this.findOne(servicioId);

    return this.prisma.requerimientoCobertura.upsert({
      where: {
        cobertura_unica_por_servicio: {
          servicioId,
          turnoId: dto.turnoId,
          categoriaId: dto.categoriaId,
          tipoDia: dto.tipoDia,
        },
      },
      update: {
        cantidadMinima: dto.cantidadMinima,
      },
      create: {
        servicioId,
        turnoId: dto.turnoId,
        categoriaId: dto.categoriaId,
        tipoDia: dto.tipoDia,
        cantidadMinima: dto.cantidadMinima,
      },
      include: {
        turno: true,
        categoria: true,
      },
    });
  }

  async findHomologos(tipoAsistencia: string) {
    return this.prisma.servicio.findMany({
      where: { tipoAsistencia, activo: true },
      orderBy: { nombre: 'asc' },
    });
  }
}
