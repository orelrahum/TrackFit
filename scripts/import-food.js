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

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Service Key:', supabaseServiceKey)

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
 * Insert food data into the Supabase foods table
 * @param {Array} foodsData - Array of food objects to insert
 * @returns {Promise<Object>} The inserted data and any error
 */
async function insertFoods(foodsData) {
  console.log(`\nProcessing ${foodsData.length} food items...`)
  const results = {
    success: 0,
    failed: 0
  }
  
  for (const [index, food] of foodsData.entries()) {
    try {
      const { data, error } = await supabase
        .from('foods')
        .insert([
          {
            name_he: food.name_he || '',
            name_en: food.name_en || '',
            calories: parseFloat(food.calories) || 0,
            protein: parseFloat(food.protein) || 0,
            fat: parseFloat(food.fat) || 0,
            carbs: parseFloat(food.carbs) || 0,
            image_url: food.image_url || null
          }
        ])
        .select()

      if (error) {
        console.error(`Failed to insert food item ${index + 1}:`, error)
        console.error('Failed food data:', food)
        results.failed++
      } else {
        console.log(`✅ Successfully inserted food item ${index + 1}/${foodsData.length}: ${food.name_he}`)
        results.success++
      }
    } catch (error) {
      console.error(`Error processing food item ${index + 1}:`, error)
      results.failed++
    }
  }
  
  console.log(`\nFood import summary:`)
  console.log(`✅ Successfully inserted: ${results.success}`)
  console.log(`❌ Failed: ${results.failed}`)
  return results
}

// Main execution
async function main() {
  try {
    const foodCsvPath = path.join(process.cwd(), 'GOV_DB', 'food.csv')

    console.log('Working directory:', process.cwd())
    console.log('Checking file existence:')
    console.log('- Food CSV exists:', fs.existsSync(foodCsvPath))

    // Read and analyze sample data
    console.log('Reading CSV file...')
    const foodsData = await parseCSV(foodCsvPath)
    console.log(`Found ${foodsData.length} foods`)
    
    // Print sample data
    console.log('\nSample food data:')
    console.log(JSON.stringify(foodsData[0], null, 2))
    
    // Process and insert foods
    console.log('\nInserting foods...')
    const foodResults = await insertFoods(foodsData)
    
    console.log('\nFinal Import Summary:')
    console.log('Foods:', `${foodResults.success} successful, ${foodResults.failed} failed`)
    
    console.log('Import completed successfully!')
  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  }
}

main()
