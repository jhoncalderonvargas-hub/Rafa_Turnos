import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type TipoNovedadUI = 'VACACIONES' | 'INCAPACIDAD_GENERAL' | 'LICENCIA_MATERNIDAD_PATERNIDAD' | 'PERMISO_REMUNERADO';

interface EmpleadoItem {
  id: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  servicioBase: string;
  tipoAsistencia: string;
  rolSistema: string;
  activo: boolean;
}

@Component({
  selector: 'app-empleados-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './empleados-admin.component.html',
})
export class EmpleadosAdminComponent {
  filtroServicio = signal<string>('');
  filtroTexto = signal<string>('');

  empleados = signal<EmpleadoItem[]>([
    { id: 'e1', numeroDocumento: '1098765431', nombres: 'Diana Carolina', apellidos: 'Mora Vargas', cargo: 'Enfermero(a) Jefe', servicioBase: 'UCI Adultos', tipoAsistencia: 'CUIDADOS_INTENSIVOS', rolSistema: 'SUPERVISOR_ENFERMERIA', activo: true },
    { id: 'e2', numeroDocumento: '1012345672', nombres: 'Camilo Andrés', apellidos: 'López Castro', cargo: 'Enfermero(a) Jefe', servicioBase: 'UCI Adultos', tipoAsistencia: 'CUIDADOS_INTENSIVOS', rolSistema: 'ASISTENCIAL', activo: true },
    { id: 'e3', numeroDocumento: '1087654323', nombres: 'Carlos Eduardo', apellidos: 'Ruiz Salamanca', cargo: 'Médico Especialista', servicioBase: 'UCI Adultos', tipoAsistencia: 'CUIDADOS_INTENSIVOS', rolSistema: 'JEFE_SERVICIO', activo: true },
    { id: 'e4', numeroDocumento: '1045678914', nombres: 'Andrea Marcela', apellidos: 'Gómez Rincón', cargo: 'Enfermero(a) Jefe', servicioBase: 'UCI Pediátrica', tipoAsistencia: 'CUIDADOS_INTENSIVOS', rolSistema: 'ASISTENCIAL', activo: true },
  ]);

  // Modal de Novedad
  modalNovedad = signal(false);
  empleadoSeleccionado = signal<EmpleadoItem | null>(null);
  novedad = signal({
    tipo: 'VACACIONES' as TipoNovedadUI,
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
  });

  empleadosFiltrados() {
    return this.empleados().filter(e => {
      const textMatch = !this.filtroTexto() ||
        `${e.apellidos} ${e.nombres} ${e.numeroDocumento}`.toLowerCase().includes(this.filtroTexto().toLowerCase());
      const servicioMatch = !this.filtroServicio() || e.servicioBase === this.filtroServicio();
      return textMatch && servicioMatch;
    });
  }

  serviciosUnicos() {
    return [...new Set(this.empleados().map(e => e.servicioBase))].sort();
  }

  abrirModalNovedad(emp: EmpleadoItem) {
    this.empleadoSeleccionado.set(emp);
    this.novedad.set({ tipo: 'VACACIONES', fechaInicio: '', fechaFin: '', descripcion: '' });
    this.modalNovedad.set(true);
  }

  cerrarModalNovedad() {
    this.modalNovedad.set(false);
    this.empleadoSeleccionado.set(null);
  }

  guardarNovedad() {
    // En la versión conectada al backend:
    // POST /api/v1/novedades con el dto correspondiente
    console.log('Novedad registrada:', { empleado: this.empleadoSeleccionado(), ...this.novedad() });
    this.cerrarModalNovedad();
  }

  claseRol(rol: string): string {
    const clases: Record<string, string> = {
      SUPERADMIN: 'bg-rose-100 text-rose-800',
      GESTION_HUMANA: 'bg-purple-100 text-purple-800',
      JEFE_SERVICIO: 'bg-sky-100 text-sky-800',
      SUPERVISOR_ENFERMERIA: 'bg-amber-100 text-amber-800',
      ASISTENCIAL: 'bg-slate-100 text-slate-700',
    };
    return clases[rol] || 'bg-slate-100 text-slate-700';
  }

  volverIntranet() {
    window.location.href = 'https://intranet.hospital.com/dashboard';
  }
}
