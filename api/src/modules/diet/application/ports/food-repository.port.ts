import { FoodItem } from '../../domain/entities/food-item.entity';

export interface IFoodRepository {
  search(query: string, limit: number): Promise<FoodItem[]>;
  findById(id: string): Promise<FoodItem | null>;
  findByIds(ids: string[]): Promise<FoodItem[]>;
  create(data: any): Promise<FoodItem>;
}
