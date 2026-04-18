import type { SesameCheck } from './sesameService';
import type { Task } from './db';

/**
 * Calculates gaps between check-out and the next check-in.
 * Only gaps within the same day are considered (based on the first and last work registry of the day).
 */
export function calculateGapsFromChecks(checks: SesameCheck[]): Task[] {
  const gaps: Task[] = [];
  
  if (checks.length < 2) {
    return gaps;
  }

  // Group checks by day to ensure we only calculate gaps within each day
  const checksByDay: Record<string, SesameCheck[]> = {};
  
  for (const check of checks) {
    const day = check.checkIn.occurredAt.split('T')[0];
    if (!checksByDay[day]) {
      checksByDay[day] = [];
    }
    checksByDay[day].push(check);
  }

  for (const day in checksByDay) {
    const dayChecks = checksByDay[day].sort((a, b) => 
      new Date(a.checkIn.occurredAt).getTime() - new Date(b.checkIn.occurredAt).getTime()
    );

    for (let i = 0; i < dayChecks.length - 1; i++) {
      const currentCheck = dayChecks[i];
      const nextCheck = dayChecks[i + 1];

      if (currentCheck.checkOut && currentCheck.checkOut.occurredAt) {
        const gapStart = new Date(currentCheck.checkOut.occurredAt);
        const gapEnd = new Date(nextCheck.checkIn.occurredAt);

        // Only add if there's an actual gap (more than 1 minute)
        if (gapEnd.getTime() - gapStart.getTime() > 60000) {
          gaps.push({
            title: 'Descanso',
            description: '',
            project: 'sesame',
            type: 'Rest',
            startTime: gapStart,
            endTime: gapEnd
          });
        }
      }
    }
  }

  // Sort all gaps by startTime
  return gaps.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}
