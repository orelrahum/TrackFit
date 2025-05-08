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
async function getNextMealGroupNumber(date: string, userId: string): Promise<number> {
  const { data: groups, error } = await supabase
    .from('meal_groups')
    .select('name')
    .eq('date', date)
    .eq('user_id', userId)

  if (error) {
    console.error('Error getting meal groups:', error)
    return 1
  }

  const numbers = (groups || [])
    .map(g => {
      const match = g.name.match(/^ארוחה (\d+)$/)
      return match ? parseInt(match[1]) : 0
    })
    .filter(n => !isNaN(n))

  return numbers.length > 0 ? Math.max(...numbers) + 1 : 1
}

export async function getOrCreateMealGroup(date: string, name?: string) {
  const userId = await getCurrentUserId()

  if (!name) {
    const nextNumber = await getNextMealGroupNumber(date, userId)
    name = `ארוחה ${nextNumber}`
  }

  // Try to get existing meal group with this name
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

  // Filter out meal groups with no meals
  const nonEmptyGroups = mealGroups?.filter(group => group.meals && group.meals.length > 0) || []
  return nonEmptyGroups
}

/**
 * Updates an existing meal's data
 */
export async function updateMeal(mealId: string, meal: Partial<Meal>) {
  const { error } = await supabase
    .from('meals')
    .update({
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
    .eq('id', mealId)

  if (error) {
    console.error('Update error details:', error)
    throw new Error(`Error updating meal: ${error.message}`)
  }
}

/**
 * Checks for and deletes meal groups that have no meals
 */
export async function deleteEmptyMealGroups(date: string) {
  const userId = await getCurrentUserId()

  // Get all meal groups for this date
  const { data: groups, error: fetchError } = await supabase
    .from('meal_groups')
    .select('id')
    .eq('date', date)
    .eq('user_id', userId)

  if (fetchError || !groups) {
    console.error('Error finding meal groups:', fetchError)
    return
  }

  // For each group, check if it has any meals
  for (const group of groups) {
    const { count, error: countError } = await supabase
      .from('meals')
      .select('id', { count: 'exact' })
      .eq('meal_group_id', group.id)

    if (countError) {
      console.error('Error counting meals:', countError)
      continue
    }

    // If group has no meals, delete it
    if (count === 0) {
      const { error: deleteError } = await supabase
        .from('meal_groups')
        .delete()
        .eq('id', group.id)

      if (deleteError) {
        console.error('Error deleting empty meal group:', deleteError)
      }
    }
  }
}

/**
 * Deletes a meal from the database
 */
export async function deleteMeal(mealId: string) {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', mealId)

  if (error) {
    console.error('Delete error details:', error)
    throw new Error(`Error deleting meal: ${error.message}`)
  }
}

/**
 * Updates a meal group's properties
 */
export async function updateMealGroup(groupId: string, data: { name: string }) {
  const { error } = await supabase
    .from('meal_groups')
    .update({ name: data.name })
    .eq('id', groupId)

  if (error) {
    console.error('Update error details:', error)
    throw new Error(`Error updating meal group: ${error.message}`)
  }
}
