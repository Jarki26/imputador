export interface TaskTypeConfig {
  name: string;
  isBillable: boolean;
  countsTowardGoal: boolean;
}

export const TASK_TYPES: TaskTypeConfig[] = [
  { name: 'APERTURAS', isBillable: true, countsTowardGoal: true },
  { name: 'ANALISIS', isBillable: true, countsTowardGoal: true },
  { name: 'DESARROLLO', isBillable: true, countsTowardGoal: true },
  { name: 'DESPLIEGUE', isBillable: true, countsTowardGoal: true },
  { name: 'DOCUMENTACION', isBillable: true, countsTowardGoal: true },
  { name: 'ENTREVISTAS', isBillable: true, countsTowardGoal: true },
  { name: 'FORMACION', isBillable: true, countsTowardGoal: true },
  { name: 'GESTION', isBillable: true, countsTowardGoal: true },
  { name: 'INCIDENCIAS', isBillable: true, countsTowardGoal: true },
  { name: 'INVESTIGAR', isBillable: true, countsTowardGoal: true },
  { name: 'MANTENIMIENTO', isBillable: true, countsTowardGoal: true },
  { name: 'MONTAJE', isBillable: true, countsTowardGoal: true },
  { name: 'OTROS', isBillable: true, countsTowardGoal: true },
  { name: 'REUNIONES', isBillable: true, countsTowardGoal: true },
  { name: 'SINCRONIZACION', isBillable: true, countsTowardGoal: true },
  { name: 'SOPORTE', isBillable: true, countsTowardGoal: true },
  { name: 'TEST', isBillable: true, countsTowardGoal: true },
  { name: 'VIAJE', isBillable: true, countsTowardGoal: true },
  { name: 'REST', isBillable: false, countsTowardGoal: false },
  { name: 'AUSENCIA FACTURABLE', isBillable: false, countsTowardGoal: true }
];

export function getTaskType(name: string): TaskTypeConfig | undefined {
  return TASK_TYPES.find((t) => t.name === name);
}

export function isBillable(name: string): boolean {
  const type = getTaskType(name);
  return type ? type.isBillable : true;
}

export function countsTowardGoal(name: string): boolean {
  const type = getTaskType(name);
  return type ? type.countsTowardGoal : true;
}
