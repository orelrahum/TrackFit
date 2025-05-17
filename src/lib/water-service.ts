import { supabase } from './supabase'
import { WaterLog } from '../types'

const getCurrentUserId = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('No user found')
  return user.id
}

/**
 * Adds or updates a water log entry for a specific date
 */
export async function updateWaterLog(date: string, amount: number) {
  const userId = await getCurrentUserId()

  const { data: existingLog, error: fetchError } = await supabase
    .from('water_logs')
    .select('id, amount')
    .eq('date', date)
    .eq('user_id', userId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching water log:', fetchError)
    throw new Error(`Error fetching water log: ${fetchError.message}`)
  }

  if (existingLog) {
    // Update existing log
    const { error: updateError } = await supabase
      .from('water_logs')
      .update({
        amount: amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingLog.id)

    if (updateError) {
      console.error('Update error details:', updateError)
      throw new Error(`Error updating water log: ${updateError.message}`)
    }
  } else {
    // Create new log
    const { error: insertError } = await supabase
      .from('water_logs')
      .insert({
        user_id: userId,
        date,
        amount,
      })

    if (insertError) {
      console.error('Insert error details:', insertError)
      throw new Error(`Error creating water log: ${insertError.message}`)
    }
  }
}

/**
 * Gets water log for a specific date
 */
export async function getWaterLogForDate(date: string): Promise<WaterLog | null> {
  const userId = await getCurrentUserId()
  
  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .eq('date', date)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Fetch error details:', error)
    throw new Error(`Error fetching water log: ${error.message}`)
  }

  return data
}
