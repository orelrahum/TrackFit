
export interface Nutrient {
  amount: number;
  target: number;
}

export interface Nutrients {
  calories: Nutrient;
  protein: Nutrient;
  carbs: Nutrient;
  fat: Nutrient;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string;
}

export interface MealGroup {
  id: string;
  name: string; // לדוגמה: "ארוחת בוקר", "ארוחת צהריים"
  meals: Meal[];
}

export interface DayData {
  date: string;
  nutrients: Nutrients;
  meals: MealGroup[];
}
