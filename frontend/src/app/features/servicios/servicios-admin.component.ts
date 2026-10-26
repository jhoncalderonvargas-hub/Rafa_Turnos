import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface ServicioItem {
  id: string;
  codigo: string;
  nombre: string;
  tipoAsistencia: string;
  ubicacionPiso: string;
  activo: boolean;
  totalPersonal: number;
}

@Component({
  selector: 'app-servicios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './servicios-admin.component.html',
})
export class ServiciosAdminComponent {
  servicios = signal<ServicioItem[]>([
    {
      id: 'srv-1',
      codigo: 'UCI-ADU',
      nombre: 'UCI Adultos',
      tipoAsistencia: 'CUIDADOS_INTENSIVOS',
      ubicacionPiso: 'Piso 3 Bloque B',
      activo: true,
      totalPersonal: 42,
    },
    {
      id: 'srv-2',
      codigo: 'UCI-PED',
      nombre: 'UCI Pediátrica',
      tipoAsistencia: 'CUIDADOS_INTENSIVOS',
      ubicacionPiso: 'Piso 3 Bloque C',
      activo: true,
      totalPersonal: 28,
    },
    {
      id: 'srv-3',
      codigo: 'URG-GEN',
      nombre: 'Urgencias Generales',
      tipoAsistencia: 'URGENCIAS',
      ubicacionPiso: 'Piso 1 Bloque A',
      activo: true,
      totalPersonal: 65,
    },
    {
      id: 'srv-4',
      codigo: 'CIR-GEN',
      nombre: 'Cirugía General',
      tipoAsistencia: 'QUIRURGICO',
      ubicacionPiso: 'Piso 2 Bloque Quirúrgico',
      activo: true,
      totalPersonal: 35,
    },
    {
      id: 'srv-5',
      codigo: 'HOSP-P3',
      nombre: 'Hospitalización Piso 3',
      tipoAsistencia: 'HOSPITALIZACION',
      ubicacionPiso: 'Piso 3 Bloque Central',
      activo: true,
      totalPersonal: 38,
    },
  ]);

  modalAbierto = signal<boolean>(false);
  nuevoServicio = signal({
    codigo: '',
    nombre: '',
    tipoAsistencia: 'CUIDADOS_INTENSIVOS',
    ubicacionPiso: '',
  });

  abrirModal() {
    this.nuevoServicio.set({
      codigo: '',
      nombre: '',
      tipoAsistencia: 'CUIDADOS_INTENSIVOS',
      ubicacionPiso: '',
    });
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardarServicio() {
    const s = this.nuevoServicio();
    if (!s.codigo || !s.nombre) return;

    this.servicios.update((lista) => [
      ...lista,
      {
        id: `srv-${Date.now()}`,
        codigo: s.codigo.toUpperCase(),
        nombre: s.nombre,
        tipoAsistencia: s.tipoAsistencia,
        ubicacionPiso: s.ubicacionPiso || 'Sin asignar',
        activo: true,
        totalPersonal: 0,
      },
    ]);

    this.cerrarModal();
  }

  toggleActivo(id: string) {
    this.servicios.update((lista) =>
      lista.map((s) => (s.id === id ? { ...s, activo: !s.activo } : s))
    );
  }

  volverIntranet() {
    window.location.href = 'https://intranet.hospital.com/dashboard';
  }
}
