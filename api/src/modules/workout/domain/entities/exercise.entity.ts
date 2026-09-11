export class Exercise {
  constructor(
    public id: string,
    public name: string,
    public muscleGroup: string,
    public equipment: string,
  ) {}

  static fromPrisma(data: any): Exercise {
    return new Exercise(data.id, data.name, data.muscleGroup, data.equipment);
  }
}
