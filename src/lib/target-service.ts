import { supabase } from './supabase'
import type { UserTargets, UserProfile } from '@/types'

const logCalculationSteps = (
  profile: UserProfile,
  bmr: number,
  maintenanceCalories: number,
  adjustedCalories: number,
  targets: UserTargets
) => {
  console.group('🎯 חישוב יעדים תזונתיים')
  
  console.log('נתוני משתמש:')
  console.log(`- גובה: ${profile.height} ס"מ`)
  console.log(`- משקל: ${profile.weight} ק"ג`)
  console.log(`- גיל: ${profile.age}`)
  console.log(`- מין: ${profile.gender === 'male' ? 'זכר' : 'נקבה'}`)
  console.log(`- רמת פעילות: ${
    profile.activity_level === 'sedentary' ? 'יושבני' :
    profile.activity_level === 'light' ? 'קל (1-2 אימונים בשבוע)' :
    profile.activity_level === 'moderate' ? 'בינוני (3-5 אימונים בשבוע)' :
    'פעיל (6-7 אימונים בשבוע)'
  }`)
  
  console.log('\nחישוב BMR:')
  if (profile.gender === 'male') {
    console.log('נוסחה לגברים:')
    console.log(`88.362 + (13.397 × ${profile.weight}) + (4.799 × ${profile.height}) - (5.677 × ${profile.age})`)
  } else {
    console.log('נוסחה לנשים:')
    console.log(`447.593 + (9.247 × ${profile.weight}) + (3.098 × ${profile.height}) - (4.330 × ${profile.age})`)
  }
  console.log(`BMR = ${bmr.toFixed(2)} קלוריות`)

  console.log('\nחישוב קלוריות לתחזוקה:')
  console.log(`מכפיל פעילות: ${
    profile.activity_level === 'sedentary' ? '1.2' :
    profile.activity_level === 'light' ? '1.375' :
    profile.activity_level === 'moderate' ? '1.55' :
    '1.725'
  }`)
  console.log(`${bmr.toFixed(2)} × מכפיל = ${maintenanceCalories.toFixed(2)} קלוריות`)

  if (profile.weight_goal !== 'maintain') {
    console.log('\nהתאמה למטרת משקל:')
    const weeklyAdjustment = profile.weight_rate * 7700
    const dailyAdjustment = weeklyAdjustment / 7
    console.log(`קצב שינוי: ${profile.weight_rate} ק"ג בשבוע`)
    console.log(`התאמה שבועית: ${weeklyAdjustment.toFixed(2)} קלוריות`)
    console.log(`התאמה יומית: ${dailyAdjustment.toFixed(2)} קלוריות`)
    console.log(`קלוריות סופי: ${adjustedCalories.toFixed(2)}`)
  }

  console.log('\nחלוקת מאקרו:')
  console.log(`מטרה: ${
    profile.weight_goal === 'loss' ? 'ירידה במשקל' :
    profile.weight_goal === 'gain' ? 'עליה במשקל' :
    'שמירה על משקל'
  }`)
  console.log('יחס:')
  console.log(`- חלבון: ${targets.protein}g (${
    profile.weight_goal === 'loss' ? '40%' :
    profile.weight_goal === 'gain' ? '30%' : '30%'
  })`)
  console.log(`- פחמימות: ${targets.carbs}g (${
    profile.weight_goal === 'loss' ? '35%' :
    profile.weight_goal === 'gain' ? '50%' : '40%'
  })`)
  console.log(`- שומן: ${targets.fat}g (${
    profile.weight_goal === 'loss' ? '25%' :
    profile.weight_goal === 'gain' ? '20%' : '30%'
  })`)
  
  console.groupEnd()
}

export const getUserTargets = async (userId: string): Promise<UserTargets> => {
  const { data, error } = await supabase
    .from('user_targets')
    .select('calories, protein, carbs, fat')
    .eq('user_id', userId)
    .single()
    
  if (error) {
    console.error('Error fetching user targets:', error)
    throw error
  }

  if (!data) {
    throw new Error('No targets found')
  }

  return {
    calories: Number(data.calories),
    protein: Number(data.protein),
    carbs: Number(data.carbs),
    fat: Number(data.fat)
  }
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
  return data
}

export const createOrUpdateUserTargets = async (userId: string, targets: Partial<UserTargets>) => {
  // Check if user targets exist
  const { data, error: checkError } = await supabase
    .from('user_targets')
    .select('user_id')
    .eq('user_id', userId)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    throw checkError
  }

  const { error } = data 
    ? await supabase
        .from('user_targets')
        .update(targets)
        .eq('user_id', userId)
    : await supabase
        .from('user_targets')
        .insert([{ user_id: userId, ...targets }])

  if (error) throw error
}

export const createUserProfile = async (userId: string, profile: Omit<UserProfile, 'id'>) => {
  const { error } = await supabase
    .from('user_profiles')
    .insert([{ id: userId, ...profile }])
  
  if (error) throw error
}

export const calculateTargets = (
  height: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: string,
  weightGoal: string,
  weightRate: number,
  currentWeight: number
): UserTargets => {
  // Harris-Benedict BMR formula
  const bmr = gender === 'male'
    ? 88.362 + (13.397 * currentWeight) + (4.799 * height) - (5.677 * age)
    : 447.593 + (9.247 * currentWeight) + (3.098 * height) - (4.330 * age)

  // Activity level multiplier
  const activityMultiplier = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725
  }[activityLevel] || 1.2

  // Calculate maintenance calories
  let maintenanceCalories = bmr * activityMultiplier

  // Adjust calories based on weight goal and rate
  // 7700 calories = 1kg of weight change
  const weeklyCalorieAdjustment = weightRate * 7700 / 7
  const targetCalories = Math.round(
    weightGoal === 'loss' 
      ? maintenanceCalories - Math.abs(weeklyCalorieAdjustment)
      : weightGoal === 'gain'
        ? maintenanceCalories + Math.abs(weeklyCalorieAdjustment)
        : maintenanceCalories
  )

  // Calculate macros based on goal
  let proteinRatio, carbsRatio, fatRatio
  if (weightGoal === 'loss') {
    proteinRatio = 0.40 // 40% protein
    carbsRatio = 0.35   // 35% carbs
    fatRatio = 0.25     // 25% fat
  } else if (weightGoal === 'gain') {
    proteinRatio = 0.30 // 30% protein
    carbsRatio = 0.50   // 50% carbs
    fatRatio = 0.20     // 20% fat
  } else {
    proteinRatio = 0.30 // 30% protein
    carbsRatio = 0.40   // 40% carbs
    fatRatio = 0.30     // 30% fat
  }

  // Convert calorie ratios to grams
  // Protein: 4 calories per gram
  // Carbs: 4 calories per gram
  // Fat: 9 calories per gram
  const targets = {
    calories: targetCalories,
    protein: Math.round((targetCalories * proteinRatio) / 4),
    carbs: Math.round((targetCalories * carbsRatio) / 4),
    fat: Math.round((targetCalories * fatRatio) / 9)
  }

  // Log calculation steps
  logCalculationSteps({
    id: '',
    height,
    weight: currentWeight,
    target_weight: 0, // לא נדרש ללוג
    age,
    gender,
    activity_level: activityLevel as UserProfile['activity_level'],
    weight_goal: weightGoal as UserProfile['weight_goal'],
    weight_rate: weightRate as UserProfile['weight_rate']
  }, bmr, maintenanceCalories, targetCalories, targets)

  return targets
}
