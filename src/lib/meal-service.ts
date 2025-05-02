import { supabase } from './supabase'
import { Meal } from '../types'

const getCurrentUserId = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('No user found')
  return user.id
}

/**
 * Creates or gets a meal group for a specific date and name
 */
export async function getOrCreateMealGroup(date: string, name: string = "ארוחה") {
  // Try to get existing meal group
  const userId = await getCurrentUserId()
  const { data: existingGroups, error: fetchError } = await supabase
    .from('meal_groups')
    .select('id')
    .eq('date', date)
    .eq('name', name)
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    if (fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Fetch error details:', fetchError)
      throw new Error(`Error fetching meal group: ${fetchError.message}`)
    }
  }

  if (existingGroups?.id) {
    return existingGroups.id
  }

  // Create new meal group if none exists
  const { data: newGroup, error: insertError } = await supabase
    .from('meal_groups')
    .insert({
      date,
      name,
      user_id: userId
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('Insert error details:', insertError)
    throw new Error(`Error creating meal group: ${insertError.message}. Check if you're logged in and have proper permissions.`)
  }

  return newGroup.id
}

/**
 * Adds a new meal to a meal group
 */
export async function addMealToGroup(mealGroupId: string, meal: Partial<Meal>) {
  const { error } = await supabase
    .from('meals')
    .insert({
      meal_group_id: mealGroupId,
      food_id: meal.food_id,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      weight: meal.weight,
      unit: meal.unit,
      image_url: meal.image_url
    })

  if (error) {
    console.error('Meal insert error details:', error)
    throw new Error(`Error adding meal: ${error.message}. Meal group ID: ${mealGroupId}`)
  }
}

/**
 * Gets all meals for a specific date
 */
export async function getMealsForDate(date: string) {
  const userId = await getCurrentUserId()
  const { data: mealGroups, error } = await supabase
    .from('meal_groups')
    .select(`
      id,
      name,
      meals (
        id,
        name,
        calories,
        protein,
        carbs,
        fat,
        weight,
        unit,
        image_url
      )
    `)
    .eq('date', date)
    .eq('user_id', userId)
    .order('created_at')

  if (error) {
    console.error('Fetch meals error details:', error)
    throw new Error(`Error fetching meals: ${error.message}. Date: ${date}, User ID: ${userId}`)
  }

  return mealGroups || []
}
