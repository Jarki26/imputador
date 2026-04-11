export interface TaskTypeConfig {
  name: string;
  isBillable: boolean;
}

export const TASK_TYPES: TaskTypeConfig[] = [
  { name: 'General', isBillable: true },
  { name: 'Feature', isBillable: true },
  { name: 'Bug', isBillable: true },
  { name: 'Rest', isBillable: false },
  { name: 'Meeting', isBillable: true },
];

export function getTaskType(name: string): TaskTypeConfig | undefined {
  return TASK_TYPES.find((t) => t.name === name);
}

export function isBillable(name: string): boolean {
  const type = getTaskType(name);
  return type ? type.isBillable : true;
}
