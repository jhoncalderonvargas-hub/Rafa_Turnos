import { Routes } from '@angular/router';
import { PlanificadorComponent } from './features/planificador/planificador.component';
import { ServiciosAdminComponent } from './features/servicios/servicios-admin.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EmpleadosAdminComponent } from './features/empleados/empleados-admin.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Torre de Control — Rafa Turnos',
  },
  {
    path: 'planificador',
    component: PlanificadorComponent,
    title: 'Planificador de Turnos — Rafa Turnos',
  },
  {
    path: 'servicios',
    component: ServiciosAdminComponent,
    title: 'Administración de Servicios — Rafa Turnos',
  },
  {
    path: 'empleados',
    component: EmpleadosAdminComponent,
    title: 'Directorio de Personal — Rafa Turnos',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
