import { describe, it, expect } from 'vitest';
import { Routine, WorkoutDay, ExerciseEntry } from './routine.entity';
import { Exercise } from './exercise.entity';
import { WorkoutSet } from './workout-set.entity';

describe('Routine Entity', () => {
  it('should calculate total exercises and total sets correctly', () => {
    const chestExercise = new Exercise('ex-1', 'Supino Reto', 'CHEST', 'Barra');
    const tricepsExercise = new Exercise('ex-2', 'Tríceps Pulley', 'TRICEPS', 'Cabo');

    const setsChest = [
      new WorkoutSet('s-1', 1, 10, 80, 90, 8),
      new WorkoutSet('s-2', 2, 8, 85, 90, 9),
      new WorkoutSet('s-3', 3, 6, 90, 120, 10),
    ];

    const setsTriceps = [
      new WorkoutSet('s-4', 1, 12, 30, 60, 8),
      new WorkoutSet('s-5', 2, 10, 35, 60, 9),
    ];

    const dayA = new WorkoutDay('day-1', 'Peito e Tríceps', 'MONDAY', [
      new ExerciseEntry('entry-1', chestExercise, 'Foco em amplitude', setsChest),
      new ExerciseEntry('entry-2', tricepsExercise, null, setsTriceps),
    ]);

    const routine = new Routine('routine-1', 'user-1', 'Hipertrofia ABC', true, [dayA]);

    expect(routine.getTotalExercises()).toBe(2);
    expect(routine.getTotalSets()).toBe(5);
  });

  it('should calculate total volume per muscle group correctly', () => {
    const chestExercise = new Exercise('ex-1', 'Supino Reto', 'CHEST', 'Barra');

    const sets = [
      new WorkoutSet('s-1', 1, 10, 80, 90), // 800 kg
      new WorkoutSet('s-2', 2, 10, 80, 90), // 800 kg
    ];

    const day = new WorkoutDay('day-1', 'Peito', 'MONDAY', [
      new ExerciseEntry('entry-1', chestExercise, null, sets),
    ]);

    const routine = new Routine('routine-1', 'user-1', 'Peito Foco', true, [day]);
    const volume = routine.getVolumeByMuscleGroup();

    expect(volume['CHEST']).toBe(1600);
  });
});
