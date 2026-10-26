import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface EstadoServicio {
  id: string;
  codigo: string;
  nombre: string;
  tipoAsistencia: string;
  totalPersonal: number;
  coberturaGlobal: number; // 0 a 100
  estadoCuadrante: 'BORRADOR' | 'VALIDADO' | 'PUBLICADO' | 'CERRADO_NOMINA';
  alertas: number;       // Nro de infracciones detectadas
  horasExtrasAcumuladas: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  anio = signal(2026);
  mes = signal(8);
  mesNombre = computed(() => {
    const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[this.mes()];
  });

  servicios = signal<EstadoServicio[]>([
    { id: 's1', codigo: 'UCI-ADU', nombre: 'UCI Adultos', tipoAsistencia: 'CUIDADOS_INTENSIVOS', totalPersonal: 42, coberturaGlobal: 100, estadoCuadrante: 'PUBLICADO', alertas: 0, horasExtrasAcumuladas: 24 },
    { id: 's2', codigo: 'UCI-PED', nombre: 'UCI Pediátrica', tipoAsistencia: 'CUIDADOS_INTENSIVOS', totalPersonal: 28, coberturaGlobal: 96, estadoCuadrante: 'BORRADOR', alertas: 1, horasExtrasAcumuladas: 0 },
    { id: 's3', codigo: 'URG-GEN', nombre: 'Urgencias Generales', tipoAsistencia: 'URGENCIAS', totalPersonal: 65, coberturaGlobal: 100, estadoCuadrante: 'PUBLICADO', alertas: 0, horasExtrasAcumuladas: 56 },
    { id: 's4', codigo: 'CIR-GEN', nombre: 'Cirugía General', tipoAsistencia: 'QUIRURGICO', totalPersonal: 35, coberturaGlobal: 88, estadoCuadrante: 'BORRADOR', alertas: 3, horasExtrasAcumuladas: 16 },
    { id: 's5', codigo: 'HOSP-P3', nombre: 'Hospitalización Piso 3', tipoAsistencia: 'HOSPITALIZACION', totalPersonal: 38, coberturaGlobal: 100, estadoCuadrante: 'VALIDADO', alertas: 0, horasExtrasAcumuladas: 8 },
  ]);

  totalPersonal = computed(() =>
    this.servicios().reduce((sum, s) => sum + s.totalPersonal, 0)
  );
  coberturaPromedio = computed(() => {
    const lista = this.servicios();
    return Math.round(lista.reduce((sum, s) => sum + s.coberturaGlobal, 0) / lista.length);
  });
  serviciosPublicados = computed(() =>
    this.servicios().filter(s => s.estadoCuadrante === 'PUBLICADO').length
  );
  totalAlertas = computed(() =>
    this.servicios().reduce((sum, s) => sum + s.alertas, 0)
  );

  claseSemaforo(cobertura: number): string {
    if (cobertura >= 100) return 'bg-emerald-100 text-emerald-800';
    if (cobertura >= 90) return 'bg-amber-100 text-amber-800';
    return 'bg-rose-100 text-rose-800';
  }

  iconoSemaforo(cobertura: number): string {
    if (cobertura >= 100) return '🟢';
    if (cobertura >= 90) return '🟡';
    return '🔴';
  }

  claseEstado(estado: string): string {
    const clases: Record<string, string> = {
      BORRADOR: 'bg-slate-100 text-slate-600',
      VALIDADO: 'bg-sky-100 text-sky-700',
      PUBLICADO: 'bg-emerald-100 text-emerald-800',
      CERRADO_NOMINA: 'bg-purple-100 text-purple-800',
    };
    return clases[estado] || 'bg-slate-100 text-slate-600';
  }

  exportarNominaGlobal() {
    window.open(`http://localhost:3000/api/v1/reportes/nomina-excel/${this.anio()}/${this.mes()}`, '_blank');
  }

  volverIntranet() {
    window.location.href = 'https://intranet.hospital.com/dashboard';
  }
}
