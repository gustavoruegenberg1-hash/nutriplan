import { WorkoutSet } from './workout-set.entity';
import { Exercise } from './exercise.entity';

export class ExerciseEntry {
  constructor(
    public id: string,
    public exercise: Exercise,
    public notes: string | null,
    public sets: WorkoutSet[],
  ) {}
}

export class WorkoutDay {
  constructor(
    public id: string,
    public name: string,
    public dayOfWeek: string,
    public exercises: ExerciseEntry[],
  ) {}
}

export class Routine {
  constructor(
    public id: string,
    public userId: string,
    public name: string,
    public isActive: boolean,
    public days: WorkoutDay[],
  ) {}

  getTotalExercises(): number {
    return this.days.reduce((total, day) => total + day.exercises.length, 0);
  }

  getTotalSets(): number {
    return this.days.reduce(
      (total, day) =>
        total + day.exercises.reduce((sets, ex) => sets + ex.sets.length, 0),
      0,
    );
  }

  getVolumeByMuscleGroup(): Record<string, number> {
    const volume: Record<string, number> = {};
    for (const day of this.days) {
      for (const ex of day.exercises) {
        const mg = ex.exercise.muscleGroup;
        const exVolume = ex.sets.reduce(
          (sum, set) => sum + set.reps * (set.weightKg || 0),
          0,
        );
        volume[mg] = (volume[mg] || 0) + exVolume;
      }
    }
    return volume;
  }

  static fromPrisma(data: any): Routine {
    const rawDays = data.workoutDays || data.days || [];
    return new Routine(
      data.id,
      data.userId,
      data.name,
      data.isActive,
      rawDays.map(
        (d: any) =>
          new WorkoutDay(
            d.id,
            d.name,
            d.dayOfWeek,
            d.exercises?.map(
              (e: any) =>
                new ExerciseEntry(
                  e.id,
                  e.exercise ? Exercise.fromPrisma(e.exercise) : ({} as any),
                  e.notes,
                  e.sets?.map(
                    (s: any) =>
                      new WorkoutSet(
                        s.id,
                        s.setNumber,
                        s.reps,
                        s.weightKg ? Number(s.weightKg) : null,
                        s.restSeconds,
                        s.rpe ? Number(s.rpe) : null,
                      ),
                  ) || [],
                ),
            ) || [],
          ),
      ),
    );
  }
}
