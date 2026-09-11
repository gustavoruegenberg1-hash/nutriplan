export class WorkoutSet {
  constructor(
    public id: string,
    public setNumber: number,
    public reps: number,
    public weightKg: number | null,
    public restSeconds: number | null,
    public rpe?: number | null,
  ) {}
}
