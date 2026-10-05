export class FoodItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly brand: string | null,
    public readonly caloriesPer100g: number,
    public readonly proteinPer100g: number,
    public readonly carbsPer100g: number,
    public readonly fatPer100g: number,
    public readonly fiberPer100g: number,
    public readonly isVerified: boolean,
    public readonly createdById: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly category?: string | null,
    public readonly source?: string | null,
    public readonly micronutrients?: any,
    public readonly legacyId?: string | null,
    public readonly subCategory?: string | null,
    public readonly tags?: string[] | null,
  ) {}

  static fromPrisma(prismaFood: any): FoodItem {
    return new FoodItem(
      prismaFood.id,
      prismaFood.name,
      prismaFood.brand,
      prismaFood.caloriesPer100g,
      prismaFood.proteinPer100g,
      prismaFood.carbsPer100g,
      prismaFood.fatPer100g,
      prismaFood.fiberPer100g,
      prismaFood.isVerified,
      prismaFood.createdById,
      prismaFood.createdAt,
      prismaFood.updatedAt,
      prismaFood.category || null,
      prismaFood.source || null,
      prismaFood.micronutrients || null,
      prismaFood.legacyId || null,
      prismaFood.subCategory || null,
      prismaFood.tags || null,
    );
  }
}
