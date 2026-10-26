import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

interface EmpleadoIntranet {
  id: string;
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  telefono_movil?: string;
  cargo: string;
  categoria_codigo: string;
  dependencia_id: string;
  estado: string;
}

interface ServicioIntranet {
  id: string;
  codigo: string;
  nombre: string;
  ubicacion_piso?: string;
  estado: string;
}

@Injectable()
export class IntranetClientService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.apiUrl = this.config.get<string>('INTRANET_API_URL', 'https://intranet.hospital.com/api/v1');
    this.apiKey = this.config.get<string>('INTRANET_API_KEY', '');
  }

  private get headers() {
    return {
      'X-API-KEY': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Sincroniza los Servicios Hospitalarios desde la Intranet.
   * Solo crea o actualiza. Nunca elimina registros locales.
   */
  async sincronizarServicios(): Promise<{ creados: number; actualizados: number }> {
    let creados = 0;
    let actualizados = 0;

    try {
      const { data } = await firstValueFrom(
        this.http.get<ServicioIntranet[]>(`${this.apiUrl}/dependencias`, {
          headers: this.headers,
        }),
      );

      for (const svc of data) {
        const existe = await this.prisma.servicio.findFirst({
          where: { intranetId: svc.id },
        });

        if (existe) {
          await this.prisma.servicio.update({
            where: { id: existe.id },
            data: {
              nombre: svc.nombre,
              ubicacionPiso: svc.ubicacion_piso,
              activo: svc.estado === 'ACTIVO',
            },
          });
          actualizados++;
        } else {
          await this.prisma.servicio.create({
            data: {
              intranetId: svc.id,
              codigo: svc.codigo,
              nombre: svc.nombre,
              tipoAsistencia: 'HOSPITALIZACION', // Valor por defecto; la supervisora ajusta
              ubicacionPiso: svc.ubicacion_piso,
              activo: svc.estado === 'ACTIVO',
            },
          });
          creados++;
        }
      }
    } catch (error) {
      console.error('Error al sincronizar servicios desde la Intranet:', error.message);
    }

    return { creados, actualizados };
  }

  /**
   * Sincroniza el Directorio de Colaboradores desde la Intranet.
   * Solo opera en el sentido Intranet → Rafa Turnos.
   */
  async sincronizarEmpleados(): Promise<{ creados: number; actualizados: number }> {
    let creados = 0;
    let actualizados = 0;

    try {
      const { data } = await firstValueFrom(
        this.http.get<EmpleadoIntranet[]>(`${this.apiUrl}/empleados?estado=ACTIVO`, {
          headers: this.headers,
        }),
      );

      for (const emp of data) {
        // Buscar el servicio base en Rafa Turnos por intranetId
        const servicio = await this.prisma.servicio.findFirst({
          where: { intranetId: emp.dependencia_id },
        });

        // Buscar la categoría local por código
        const categoria = await this.prisma.categoriaProfesional.findFirst({
          where: { codigo: emp.categoria_codigo },
        });

        if (!servicio || !categoria) continue; // No puede crear el empleado sin base local

        const existe = await this.prisma.empleado.findFirst({
          where: { intranetId: emp.id },
        });

        const payload = {
          numeroDocumento: emp.numero_documento,
          tipoDocumento: emp.tipo_documento,
          nombres: emp.nombres,
          apellidos: emp.apellidos,
          correoElectronico: emp.correo_electronico,
          telefonoMovil: emp.telefono_movil,
          servicioBaseId: servicio.id,
          categoriaId: categoria.id,
          activo: emp.estado === 'ACTIVO',
        };

        if (existe) {
          await this.prisma.empleado.update({
            where: { id: existe.id },
            data: payload,
          });
          actualizados++;
        } else {
          await this.prisma.empleado.create({
            data: { ...payload, intranetId: emp.id },
          });
          creados++;
        }
      }
    } catch (error) {
      console.error('Error al sincronizar empleados desde la Intranet:', error.message);
    }

    return { creados, actualizados };
  }
}
