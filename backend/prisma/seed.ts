import { PrismaClient, TipoDia, RolUsuario } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏥 Iniciando siembra de datos hospitalarios para Rafa Turnos...');

  // 1. SERVICIOS HOSPITALARIOS (Organizados por tipoAsistencia)
  const serviciosData = [
    {
      codigo: 'UCI-ADU',
      nombre: 'UCI Adultos',
      tipoAsistencia: 'CUIDADOS_INTENSIVOS',
      ubicacionPiso: 'Piso 3 Bloque B',
    },
    {
      codigo: 'UCI-PED',
      nombre: 'UCI Pediátrica',
      tipoAsistencia: 'CUIDADOS_INTENSIVOS',
      ubicacionPiso: 'Piso 3 Bloque C',
    },
    {
      codigo: 'URG-GEN',
      nombre: 'Urgencias Generales',
      tipoAsistencia: 'URGENCIAS',
      ubicacionPiso: 'Piso 1 Bloque A',
    },
    {
      codigo: 'CIR-GEN',
      nombre: 'Cirugía General',
      tipoAsistencia: 'QUIRURGICO',
      ubicacionPiso: 'Piso 2 Bloque Quirúrgico',
    },
    {
      codigo: 'HOSP-P3',
      nombre: 'Hospitalización Piso 3',
      tipoAsistencia: 'HOSPITALIZACION',
      ubicacionPiso: 'Piso 3 Bloque Central',
    },
  ];

  const serviciosMap = new Map<string, any>();
  for (const s of serviciosData) {
    const servicio = await prisma.servicio.upsert({
      where: { codigo: s.codigo },
      update: s,
      create: s,
    });
    serviciosMap.set(s.codigo, servicio);
  }
  console.log(`✅ ${serviciosData.length} Servicios hospitalarios sembrados.`);

  // 2. CATEGORÍAS PROFESIONALES ASISTENCIALES
  const categoriasData = [
    { codigo: 'MED_ESP', nombre: 'Médico Especialista', descripcion: 'Médicos especialistas de área o intensivistas' },
    { codigo: 'MED_GEN', nombre: 'Médico General', descripcion: 'Médicos de planta y urgencias' },
    { codigo: 'ENF_JEFE', nombre: 'Enfermero(a) Jefe', descripcion: 'Profesionales de enfermería a cargo del servicio' },
    { codigo: 'AUX_ENF', nombre: 'Auxiliar de Enfermería', descripcion: 'Personal técnico de apoyo asistencial continuo' },
  ];

  const categoriasMap = new Map<string, any>();
  for (const c of categoriasData) {
    const cat = await prisma.categoriaProfesional.upsert({
      where: { codigo: c.codigo },
      update: c,
      create: c,
    });
    categoriasMap.set(c.codigo, cat);
  }
  console.log(`✅ ${categoriasData.length} Categorías profesionales sembradas.`);

  // 3. CATÁLOGO CROMÁTICO DE TURNOS (PARIDAD THURNI)
  const turnosData = [
    {
      codigo: 'M',
      nombre: 'Mañana 6h',
      horaInicio: '07:00',
      horaFin: '13:00',
      duracionHoras: 6.0,
      esLaboral: true,
      esNocturno: false,
      colorHex: '#E0F2FE',
      colorTexto: '#0369A1',
    },
    {
      codigo: 'T',
      nombre: 'Tarde 6h',
      horaInicio: '13:00',
      horaFin: '19:00',
      duracionHoras: 6.0,
      esLaboral: true,
      esNocturno: false,
      colorHex: '#FEF3C7',
      colorTexto: '#B45309',
    },
    {
      codigo: 'N',
      nombre: 'Noche Asistencial 12h',
      horaInicio: '19:00',
      horaFin: '07:00',
      duracionHoras: 12.0,
      esLaboral: true,
      esNocturno: true,
      colorHex: '#EDE9FE',
      colorTexto: '#6D28D9',
    },
    {
      codigo: 'G12',
      nombre: 'Guardia Diurna 12h',
      horaInicio: '07:00',
      horaFin: '19:00',
      duracionHoras: 12.0,
      esLaboral: true,
      esNocturno: false,
      colorHex: '#FFEDD5',
      colorTexto: '#C2410C',
    },
    {
      codigo: 'G24',
      nombre: 'Guardia Médica 24h',
      horaInicio: '07:00',
      horaFin: '07:00',
      duracionHoras: 24.0,
      esLaboral: true,
      esNocturno: true,
      colorHex: '#FEE2E2',
      colorTexto: '#B91C1C',
    },
    {
      codigo: 'S',
      nombre: 'Saliente de Guardia',
      horaInicio: null,
      horaFin: null,
      duracionHoras: 0.0,
      esLaboral: false,
      esNocturno: false,
      colorHex: '#ECFEFF',
      colorTexto: '#0E7490',
    },
    {
      codigo: 'L',
      nombre: 'Libre Programado',
      horaInicio: null,
      horaFin: null,
      duracionHoras: 0.0,
      esLaboral: false,
      esNocturno: false,
      colorHex: '#F3F4F6',
      colorTexto: '#4B5563',
    },
    {
      codigo: 'VAC',
      nombre: 'Vacaciones',
      horaInicio: null,
      horaFin: null,
      duracionHoras: 0.0,
      esLaboral: false,
      esNocturno: false,
      colorHex: '#D1FAE5',
      colorTexto: '#047857',
    },
    {
      codigo: 'INC',
      nombre: 'Incapacidad Médica',
      horaInicio: null,
      horaFin: null,
      duracionHoras: 0.0,
      esLaboral: false,
      esNocturno: false,
      colorHex: '#FCE7F3',
      colorTexto: '#BE185D',
    },
  ];

  const turnosMap = new Map<string, any>();
  for (const t of turnosData) {
    const turno = await prisma.tipoTurno.upsert({
      where: { codigo: t.codigo },
      update: t,
      create: t,
    });
    turnosMap.set(t.codigo, turno);
  }
  console.log(`✅ ${turnosData.length} Tipos de turnos sembrados.`);

  // 4. COBERTURAS MÍNIMAS PARA UCI ADULTOS
  const uciAdultos = serviciosMap.get('UCI-ADU');
  const enfJefe = categoriasMap.get('ENF_JEFE');
  const auxEnf = categoriasMap.get('AUX_ENF');
  const medEsp = categoriasMap.get('MED_ESP');
  const turnoM = turnosMap.get('M');
  const turnoT = turnosMap.get('T');
  const turnoN = turnosMap.get('N');

  const coberturasUci = [
    // Mañana
    { servicioId: uciAdultos.id, turnoId: turnoM.id, categoriaId: enfJefe.id, tipoDia: TipoDia.ORDINARIO_HABIL, cantidadMinima: 2 },
    { servicioId: uciAdultos.id, turnoId: turnoM.id, categoriaId: auxEnf.id, tipoDia: TipoDia.ORDINARIO_HABIL, cantidadMinima: 4 },
    { servicioId: uciAdultos.id, turnoId: turnoM.id, categoriaId: medEsp.id, tipoDia: TipoDia.ORDINARIO_HABIL, cantidadMinima: 1 },
    // Tarde
    { servicioId: uciAdultos.id, turnoId: turnoT.id, categoriaId: enfJefe.id, tipoDia: TipoDia.ORDINARIO_HABIL, cantidadMinima: 2 },
    { servicioId: uciAdultos.id, turnoId: turnoT.id, categoriaId: auxEnf.id, tipoDia: TipoDia.ORDINARIO_HABIL, cantidadMinima: 4 },
    // Noche
    { servicioId: uciAdultos.id, turnoId: turnoN.id, categoriaId: enfJefe.id, tipoDia: TipoDia.ORDINARIO_HABIL, cantidadMinima: 2 },
    { servicioId: uciAdultos.id, turnoId: turnoN.id, categoriaId: auxEnf.id, tipoDia: TipoDia.ORDINARIO_HABIL, cantidadMinima: 4 },
    { servicioId: uciAdultos.id, turnoId: turnoN.id, categoriaId: medEsp.id, tipoDia: TipoDia.ORDINARIO_HABIL, cantidadMinima: 1 },
  ];

  for (const cob of coberturasUci) {
    await prisma.requerimientoCobertura.upsert({
      where: {
        cobertura_unica_por_servicio: {
          servicioId: cob.servicioId,
          turnoId: cob.turnoId,
          categoriaId: cob.categoriaId,
          tipoDia: cob.tipoDia,
        },
      },
      update: { cantidadMinima: cob.cantidadMinima },
      create: cob,
    });
  }
  console.log(`✅ Coberturas mínimas de UCI Adultos sembradas.`);

  // 5. COLABORADORES DE PRUEBA (CON SOPORTE PARA ROTACIÓN HOMÓLOGA)
  const uciPediátrica = serviciosMap.get('UCI-PED');
  const empleadosData = [
    {
      numeroDocumento: '1098765431',
      nombres: 'Diana Carolina',
      apellidos: 'Mora Vargas',
      correoElectronico: 'diana.mora@hospital.gov.co',
      rolSistema: RolUsuario.SUPERVISOR_ENFERMERIA,
      servicioBaseId: uciAdultos.id,
      categoriaId: enfJefe.id,
      horasSemanalesLey: 44.0,
    },
    {
      numeroDocumento: '1012345672',
      nombres: 'Camilo Andrés',
      apellidos: 'López Castro',
      correoElectronico: 'camilo.lopez@hospital.gov.co',
      rolSistema: RolUsuario.ASISTENCIAL,
      servicioBaseId: uciAdultos.id,
      categoriaId: enfJefe.id,
      horasSemanalesLey: 44.0,
    },
    {
      numeroDocumento: '1087654323',
      nombres: 'Carlos Eduardo',
      apellidos: 'Ruiz Salamanca',
      correoElectronico: 'carlos.ruiz@hospital.gov.co',
      rolSistema: RolUsuario.JEFE_SERVICIO,
      servicioBaseId: uciAdultos.id,
      categoriaId: medEsp.id,
      horasSemanalesLey: 44.0,
    },
    {
      numeroDocumento: '1045678914',
      nombres: 'Andrea Marcela',
      apellidos: 'Gómez Rincón',
      correoElectronico: 'andrea.gomez@hospital.gov.co',
      rolSistema: RolUsuario.ASISTENCIAL,
      // Base en UCI Pediátrica pero homóloga a UCI Adultos (CUIDADOS_INTENSIVOS)
      servicioBaseId: uciPediátrica.id,
      categoriaId: enfJefe.id,
      horasSemanalesLey: 44.0,
    },
  ];

  for (const emp of empleadosData) {
    await prisma.empleado.upsert({
      where: { numeroDocumento: emp.numeroDocumento },
      update: emp,
      create: emp,
    });
  }
  console.log(`✅ ${empleadosData.length} Empleados de prueba sembrados.`);

  // 6. FESTIVOS OFICIALES COLOMBIA 2026 (Muestra de referencia)
  const festivos2026 = [
    { fecha: new Date('2026-01-01'), descripcion: 'Año Nuevo', anio: 2026 },
    { fecha: new Date('2026-01-12'), descripcion: 'Día de los Reyes Magos', anio: 2026 },
    { fecha: new Date('2026-03-23'), descripcion: 'Día de San José', anio: 2026 },
    { fecha: new Date('2026-04-02'), descripcion: 'Jueves Santo', anio: 2026 },
    { fecha: new Date('2026-04-03'), descripcion: 'Viernes Santo', anio: 2026 },
    { fecha: new Date('2026-05-01'), descripcion: 'Día del Trabajo', anio: 2026 },
    { fecha: new Date('2026-05-18'), descripcion: 'Ascensión del Señor', anio: 2026 },
    { fecha: new Date('2026-06-08'), descripcion: 'Corpus Christi', anio: 2026 },
    { fecha: new Date('2026-06-15'), descripcion: 'Sagrado Corazón de Jesús', anio: 2026 },
    { fecha: new Date('2026-06-29'), descripcion: 'San Pedro y San Pablo', anio: 2026 },
    { fecha: new Date('2026-07-20'), descripcion: 'Día de la Independencia', anio: 2026 },
    { fecha: new Date('2026-08-07'), descripcion: 'Batalla de Boyacá', anio: 2026 },
    { fecha: new Date('2026-08-17'), descripcion: 'La Asunción de la Virgen', anio: 2026 },
    { fecha: new Date('2026-10-12'), descripcion: 'Día de la Raza', anio: 2026 },
    { fecha: new Date('2026-11-02'), descripcion: 'Todos los Santos', anio: 2026 },
    { fecha: new Date('2026-11-16'), descripcion: 'Independencia de Cartagena', anio: 2026 },
    { fecha: new Date('2026-12-08'), descripcion: 'Inmaculada Concepción', anio: 2026 },
    { fecha: new Date('2026-12-25'), descripcion: 'Navidad', anio: 2026 },
  ];

  for (const f of festivos2026) {
    await prisma.festivoColombia.upsert({
      where: { fecha: f.fecha },
      update: f,
      create: f,
    });
  }
  console.log(`✅ ${festivos2026.length} Festivos de Colombia 2026 sembrados.`);

  console.log('🎉 Siembra de datos hospitalarios completada exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
