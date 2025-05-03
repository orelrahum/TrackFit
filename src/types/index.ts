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
  food_id?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url?: string;
  weight?: number;
  unit?: string;
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

export interface DBFood {
  id: string;
  name_he: string;
  name_en: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  food_measurement_units?: DBFoodMeasurementUnit[];
}

export interface DBFoodMeasurementUnit {
  food_id: string;
  unit: string;
  grams: number;
}

export interface UserProfile {
  id: string;
  height: number;
  weight: number;
  target_weight: number;
  age: number;
  gender: 'male' | 'female';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active';
  weight_goal: 'loss' | 'gain' | 'maintain';
  weight_rate: 0.25 | 0.5; // קצב שינוי משקל בק"ג לשבוע
  created_at?: string;
  updated_at?: string;
}

export interface UserTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
