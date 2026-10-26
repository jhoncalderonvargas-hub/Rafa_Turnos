import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

interface FichaTurno {
  codigo: string;
  nombre: string;
  horario: string;
  claseCss: string;
}

interface ColaboradorCuadrante {
  id: string;
  nombre: string;
  apellidos: string;
  cargo: string;
  servicioBase: string;
  horasPactadas: number;
  turnosPorDia: { [dia: number]: string }; // ej. { 1: 'M', 2: 'T', ... }
}

@Component({
  selector: 'app-planificador',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './planificador.component.html',
})
export class PlanificadorComponent {
  // Estado con Angular Signals
  servicioActual = signal<string>('UCI Adultos');
  anioActual = signal<number>(2026);
  mesActual = signal<number>(8); // Agosto
  diasDelMes = computed(() => {
    const totalDias = new Date(this.anioActual(), this.mesActual(), 0).getDate();
    return Array.from({ length: totalDias }, (_, i) => i + 1);
  });

  // Paleta de turnos estilo Thurni
  paletaTurnos: FichaTurno[] = [
    { codigo: 'M', nombre: 'Mañana', horario: '07-13h', claseCss: 'turno-M' },
    { codigo: 'T', nombre: 'Tarde', horario: '13-19h', claseCss: 'turno-T' },
    { codigo: 'N', nombre: 'Noche', horario: '19-07h', claseCss: 'turno-N' },
    { codigo: 'G12', nombre: 'Guardia 12h', horario: '07-19h', claseCss: 'turno-G12' },
    { codigo: 'S', nombre: 'Saliente', horario: 'Post-noche', claseCss: 'turno-S' },
    { codigo: 'L', nombre: 'Libre', horario: 'Descanso', claseCss: 'turno-L' },
    { codigo: 'VAC', nombre: 'Vacaciones', horario: 'Legal', claseCss: 'turno-VAC' },
    { codigo: 'INC', nombre: 'Incapacidad', horario: 'Médico', claseCss: 'turno-INC' },
  ];

  // Datos simulados de demostración inmediata
  colaboradores = signal<ColaboradorCuadrante[]>([
    {
      id: 'emp-1',
      nombre: 'Diana',
      apellidos: 'Mora',
      cargo: 'Enfermera Jefe',
      servicioBase: 'UCI Adultos',
      horasPactadas: 176,
      turnosPorDia: { 1: 'N', 2: 'S', 3: 'M', 4: 'M', 5: 'T', 6: 'L', 7: 'L', 8: 'M' },
    },
    {
      id: 'emp-2',
      nombre: 'Camilo',
      apellidos: 'López',
      cargo: 'Enfermero Jefe',
      servicioBase: 'UCI Adultos',
      horasPactadas: 176,
      turnosPorDia: { 1: 'M', 2: 'M', 3: 'T', 4: 'T', 5: 'N', 6: 'S', 7: 'L', 8: 'N' },
    },
    {
      id: 'emp-3',
      nombre: 'Carlos',
      apellidos: 'Ruiz',
      cargo: 'Médico Especialista',
      servicioBase: 'UCI Adultos',
      horasPactadas: 160,
      turnosPorDia: { 1: 'G12', 2: 'L', 3: 'M', 4: 'M', 5: 'G12', 6: 'L', 7: 'L', 8: 'M' },
    },
    {
      id: 'emp-4',
      nombre: 'Andrea',
      apellidos: 'Gómez',
      cargo: 'Auxiliar de Enfermería',
      servicioBase: 'UCI Pediátrica', // Rotación homóloga
      horasPactadas: 176,
      turnosPorDia: { 1: 'T', 2: 'T', 3: 'L', 4: 'N', 5: 'S', 6: 'M', 7: 'M', 8: 'L' },
    },
  ]);

  // Mensaje flotante de alerta/validación
  alertaValidacion = signal<string | null>(null);

  /**
   * Evento de recepción Drag & Drop en la celda
   */
  onDropEnCelda(colaboradorId: string, dia: number, event: CdkDragDrop<any>) {
    const turnoArrastrado = event.item.data as FichaTurno;
    if (!turnoArrastrado) return;

    this.asignarTurno(colaboradorId, dia, turnoArrastrado.codigo);
  }

  /**
   * Asignación y verificación instantánea de descansos
   */
  asignarTurno(colaboradorId: string, dia: number, codigoTurno: string) {
    this.colaboradores.update((lista) =>
      lista.map((colab) => {
        if (colab.id !== colaboradorId) return colab;

        // Validación clínica: si ayer fue Noche (N) y hoy se intenta asignar Mañana (M)
        const turnoAyer = colab.turnosPorDia[dia - 1];
        if (turnoAyer === 'N' && (codigoTurno === 'M' || codigoTurno === 'T')) {
          this.mostrarAlerta(
            `⚠️ Infracción de descanso para ${colab.nombre}: Salió de turno nocturno el día anterior. Debe descansar (Saliente o Libre).`
          );
        } else {
          this.alertaValidacion.set(null);
        }

        return {
          ...colab,
          turnosPorDia: {
            ...colab.turnosPorDia,
            [dia]: codigoTurno,
          },
        };
      })
    );
  }

  mostrarAlerta(mensaje: string) {
    this.alertaValidacion.set(mensaje);
    setTimeout(() => this.alertaValidacion.set(null), 6000);
  }

  calcularHorasMes(colaborador: ColaboradorCuadrante): number {
    let horas = 0;
    Object.values(colaborador.turnosPorDia).forEach((t) => {
      if (t === 'M' || t === 'T') horas += 6;
      else if (t === 'N' || t === 'G12') horas += 12;
      else if (t === 'G24') horas += 24;
    });
    return horas;
  }

  calcularCoberturaTurno(dia: number, codigoTurno: string): number {
    return this.colaboradores().filter((c) => c.turnosPorDia[dia] === codigoTurno).length;
  }

  volverIntranet() {
    window.location.href = 'https://intranet.hospital.com/dashboard';
  }

  descargarExcel() {
    window.open(`http://localhost:3000/api/v1/reportes/nomina-excel/${this.anioActual()}/${this.mesActual()}`, '_blank');
  }
}
