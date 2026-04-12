export interface TaskTypeConfig {
  name: string;
  isBillable: boolean;
  countsTowardGoal: boolean;
}

export const TASK_TYPES: TaskTypeConfig[] = [
  { name: 'General', isBillable: true, countsTowardGoal: true },
  { name: 'Feature', isBillable: true, countsTowardGoal: true },
  { name: 'Bug', isBillable: true, countsTowardGoal: true },
  { name: 'Rest', isBillable: false, countsTowardGoal: false },
  { name: 'Meeting', isBillable: true, countsTowardGoal: true },
  { name: 'Ausencia Facturable', isBillable: false, countsTowardGoal: true },
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
