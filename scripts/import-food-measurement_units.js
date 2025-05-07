import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

import { fileURLToPath } from 'url'

// Configure path to .env file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '../.env')
console.log('Loading environment from:', envPath)
dotenv.config({ path: envPath })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY


if (!supabaseUrl || !supabaseServiceKey) {
  console.error(`
Please create a .env file in the project root with the following content:
VITE_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

You can find these values in your Supabase project settings -> API
  `)
  throw new Error('Missing Supabase environment variables')
}

console.log('Supabase URL configured:', supabaseUrl ? 'Yes' : 'No')
console.log('Supabase Service Key configured:', supabaseServiceKey ? 'Yes' : 'No')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Read and parse a CSV file
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} Parsed CSV data
 */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`))
      return
    }

    console.log('Parsing CSV file:', filePath)
    const results = []
    fs.createReadStream(filePath)
      .pipe(parse({ 
        columns: true, 
        skip_empty_lines: true,
        // Log the first line to see headers
        on_record: (record, { lines }) => {
          if (lines === 1) {
            console.log('CSV Headers:', Object.keys(record))
          }
          return record
        }
      }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => {
        console.error('Error parsing CSV:', error)
        reject(error)
      })
  })
}

/**
 * Get food UUIDs from the Supabase foods table
 * @returns {Promise<Map<string, string>>} Mapping of Hebrew food names to UUIDs
 */
async function getFoodUuids() {
  console.log('\nFetching food UUIDs from database...')
  
  const foodUuids = new Map()
  let from = 0
  const size = 1000
  
  while (true) {
    console.log(`Fetching records ${from} to ${from + size}...`)
    const { data, error, count } = await supabase
      .from('foods')
      .select('id, name_he', { count: 'exact' })
      .range(from, from + size - 1)
    
    if (error) {
      console.error('Error fetching food UUIDs:', error)
      throw error
    }

    // Process this batch
    for (const food of data) {
      if (food.name_he && food.id) {
        foodUuids.set(food.name_he, food.id)
        
      }
    }

    // If we got less than the requested size, we're done
    if (data.length < size) {
      break
    }

    from += size
  }
  
  console.log(`Found ${foodUuids.size} food items with UUIDs`)
  return foodUuids
}

/**
 * Insert measurement units data into the Supabase food_measurement_units table
 * @param {Array} unitsData - Array of measurement unit objects to insert
 * @param {Map<string, string>} foodUuids - Mapping of food names to UUIDs
 * @returns {Promise<Object>} The inserted data and any error
 */
async function insertMeasurementUnits(unitsData, foodUuids) {
  // Add detailed debug logging for CSV structure
  console.log('\n=== CSV Structure Analysis ===')
  console.log('Column names:', Object.keys(unitsData[0]))
  console.log('Sample record:', JSON.stringify(unitsData[0], null, 2))
  console.log('Total records:', unitsData.length)
  console.log('===========================\n')
  
  const results = {
    success: 0,
    failed: 0,
    skipped: 0
  }
  
  // Get the correct column names from the first record
  const columns = Object.keys(unitsData[0])
  const nameColumn = columns.find(col => col.toLowerCase().includes('name') || col.toLowerCase().includes('שם'))
  const unitColumn = columns.find(col => col.toLowerCase().includes('unit') || col.toLowerCase().includes('יחידה'))
  const gramsColumn = columns.find(col => col.toLowerCase().includes('gram') || col.toLowerCase().includes('גרם'))
  
  if (!nameColumn || !unitColumn || !gramsColumn) {
    console.error('Required columns not found:')
    console.error('Name column:', nameColumn)
    console.error('Unit column:', unitColumn)
    console.error('Grams column:', gramsColumn)
    throw new Error('Missing required columns in CSV')
  }

  console.log('Using columns:')
  console.log(`- Name: ${nameColumn}`)
  console.log(`- Unit: ${unitColumn}`)
  console.log(`- Grams: ${gramsColumn}`)
  
  for (const [index, unit] of unitsData.entries()) {
    try {
      const foodName = unit[nameColumn]
      const foodUuid = foodUuids.get(foodName)
      
      if (!foodUuid) {
        console.log(`Skipping unit for food: ${foodName} - UUID not found`)
        results.skipped++
        continue
      }

      const { data, error } = await supabase
        .from('food_measurement_units')
        .insert([
          {
            food_id: foodUuid,
            unit: unit[unitColumn] || '',
            grams: parseFloat(unit[gramsColumn]) || 0
          }
        ])
        .select()

      if (error) {
        console.error(`Failed to insert measurement unit ${index + 1}:`, error)
        console.error('Failed unit data:', unit)
        results.failed++
      } else {
        console.log(`✅ Successfully inserted measurement unit ${index + 1}/${unitsData.length}: ${unit[unitColumn]} for food: ${foodName}`)
        results.success++
      }
    } catch (error) {
      console.error(`Error processing measurement unit ${index + 1}:`, error)
      results.failed++
    }
  }
  
  console.log(`\nMeasurement units import summary:`)
  console.log(`✅ Successfully inserted: ${results.success}`)
  console.log(`❌ Failed: ${results.failed}`)
  return results
}

// Main execution
async function main() {
  try {
    const unitsCsvPath = path.join(process.cwd(), 'GOV_DB', 'food_measurement_units.csv')

    console.log('Working directory:', process.cwd())
    console.log('Checking file existence:')
    console.log('- Units CSV exists:', fs.existsSync(unitsCsvPath))

    // First get all existing food UUIDs
    const foodUuids = await getFoodUuids()
    
    // Read measurement units data
    console.log('\nReading measurement units CSV file...')
    const unitsData = await parseCSV(unitsCsvPath)
    console.log(`Found ${unitsData.length} measurement units`)
    
    // Print sample data
    console.log('\nSample measurement unit data:')
    console.log(JSON.stringify(unitsData[0], null, 2))
    
    // Process measurement units with the food UUIDs
    console.log('\nInserting measurement units...')
    const unitResults = await insertMeasurementUnits(unitsData, foodUuids)
    
    console.log('\nFinal Import Summary:')
    console.log('Units:', `${unitResults.success} successful, ${unitResults.failed} failed, ${unitResults.skipped} skipped`)
    
    console.log('Import completed successfully!')
  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  }
}

main()
