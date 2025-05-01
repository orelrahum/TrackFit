import { supabase } from './supabase'
import type { DBFood, DBFoodMeasurementUnit } from '../types'

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
export function calculateNutrition(
  food: DBFood,
  amount: number,
  unit: string
) {
  // Find the selected unit's gram equivalent
  const measurementUnit = food.food_measurement_units?.find(
    mu => mu.unit === unit
  )
  if (!measurementUnit) {
    throw new Error(`Unit ${unit} not found for food ${food.name_he}`)
  }

  // Calculate total grams
  const totalGrams = amount * measurementUnit.grams

  // Calculate nutrition based on total grams (values in food are per 100g)
  const multiplier = totalGrams / 100
  return {
    calories: Math.round(food.calories * multiplier),
    protein: Math.round(food.protein * multiplier),
    fat: Math.round(food.fat * multiplier),
    carbs: Math.round(food.carbs * multiplier),
  }
}
