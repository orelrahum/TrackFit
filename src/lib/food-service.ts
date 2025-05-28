import { supabase } from './supabase'
import type { DBFood, DBFoodMeasurementUnit } from '../types'
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetches all foods with their measurement units
 */
export async function getAllFoods() {
  const { data, error } = await supabase
    .from('foods')
    .select(`
      *,
      food_measurement_units (
        unit,
        grams
      )
    `)
    .order('name_he')
  
  if (error) throw new Error(`Error fetching foods: ${error.message}`)
  return data as DBFood[]
}

/**
 * Searches foods by name (Hebrew or English)
 */
export async function searchFoods(query: string) {
  // Sanitize query
  const cleanQuery = query.trim();

  const { data, error } = await supabase
    .from('foods')
    .select(`
      *,
      food_measurement_units (
        unit,
        grams
      )
    `)
    .or(`name_he.ilike.%${cleanQuery}%,name_en.ilike.%${cleanQuery}%`)
    .order('name_he')
    .limit(8)
  
  if (error) throw new Error(`Error searching foods: ${error.message}`)
  return data as DBFood[]
}

/**
 * Gets measurement units for a specific food
 */
export async function getFoodMeasurementUnits(foodId: string) {
  const { data, error } = await supabase
    .from('food_measurement_units')
    .select('*')
    .eq('food_id', foodId)
    .order('unit')
  
  if (error) throw new Error(`Error fetching measurement units: ${error.message}`)
  return data as DBFoodMeasurementUnit[]
}

/**
 * Calculates nutritional values based on amount and unit
 */

/**
 * Adds a new food to the database
 */
export async function addFood(food: Omit<DBFood, 'id' | 'created_at' | 'updated_at'>) {
  const foodId = uuidv4();
  const { data, error } = await supabase
    .from('foods')
    .insert([
      {
        id: foodId,
        ...food
      }
    ])
    .select()
    .single();

  if (error) throw new Error(`Error adding food: ${error.message}`);
  return { ...data, id: foodId } as DBFood;
}

/**
 * Adds measurement units for a food
 */
export async function addFoodMeasurementUnits(foodId: string, units: Omit<DBFoodMeasurementUnit, 'food_id'>[]) {
  const { data, error } = await supabase
    .from('food_measurement_units')
    .insert(
      units.map(unit => ({
        food_id: foodId,
        ...unit
      }))
    );

  if (error) throw new Error(`Error adding measurement units: ${error.message}`);
}

export function calculateNutrition(
  food: DBFood,
  amount: number,
  unit: string
) {
  let totalGrams: number;
  
  // If using גרמים, use direct gram conversion (1:1)
  if (unit === "גרמים") {
    totalGrams = amount;
  } else {
    // For other units, find the conversion from food_measurement_units
    if (!food.food_measurement_units || food.food_measurement_units.length === 0) {
      throw new Error(`Only גרמים unit is available for food ${food.name_he}`);
    }
    const measurementUnit = food.food_measurement_units.find(mu => mu.unit === unit);
    if (!measurementUnit) {
      throw new Error(`Unit ${unit} not found for food ${food.name_he}`);
    }
    totalGrams = amount * measurementUnit.grams;
  }

  // Calculate nutrition based on total grams (values in food are per 100g)
  const multiplier = totalGrams / 100
  return {
    calories: Math.round(food.calories * multiplier),
    protein: Math.round(food.protein * multiplier),
    fat: Math.round(food.fat * multiplier),
    carbs: Math.round(food.carbs * multiplier),
  }
}
