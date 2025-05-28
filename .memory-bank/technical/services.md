# Services Documentation

## Overview
The services layer manages all data operations and external API interactions in the application.

## Service Structure

### Base Configuration

#### Supabase Client (`src/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Core Services

### Food Service (`src/lib/food-service.ts`)
- Purpose: Manages food database operations
- Key Functions:
  - Search foods
  - Get nutritional information
  - Handle portion calculations
- Data Source: `GOV_DB/food.csv`

### Meal Service (`src/lib/meal-service.ts`)
- Purpose: Handles meal tracking operations
- Key Functions:
  - CRUD operations for meals
  - Daily meal summaries
  - Nutrient calculations
- Database Integration: meals table

### Water Service (`src/lib/water-service.ts`)
- Purpose: Manages water intake tracking
- Key Functions:
  - Track water consumption
  - Calculate daily totals
  - Update water goals
- Database Integration: water_intake table

### Target Service (`src/lib/target-service.ts`)
- Purpose: Manages user fitness targets
- Key Functions:
  - Set user goals
  - Track progress
  - Calculate achievements
- Database Integration: user_targets table

## Utility Services

### Meal Utils (`src/lib/meal-utils.ts`)
```typescript
// Example utility functions
export const calculateMealNutrients = (food, portionSize) => {
  return {
    calories: (food.calories * portionSize) / 100,
    protein: (food.protein * portionSize) / 100,
    carbs: (food.carbs * portionSize) / 100,
    fat: (food.fat * portionSize) / 100
  }
}

export const categorizeMealType = (hour: number) => {
  if (hour < 11) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 19) return 'dinner'
  return 'snack'
}
```

### Utils (`src/lib/utils.ts`)
- Common utility functions
- Date formatting
- Data transformations
- Type conversions

## Error Handling

### Service Error Patterns
```typescript
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

// Usage example
try {
  const result = await mealService.createMeal(data)
} catch (error) {
  if (error instanceof ServiceError) {
    // Handle specific error
  }
  // Handle general error
}
```

## Data Flow Patterns

### Create Operations
1. Validate input data
2. Transform data if needed
3. Execute database operation
4. Return result or handle error

### Read Operations
1. Check cache (if applicable)
2. Query database
3. Transform response
4. Cache result (if applicable)
5. Return data

### Update Operations
1. Validate input
2. Check existing record
3. Apply updates
4. Return updated record

### Delete Operations
1. Verify record exists
2. Check permissions
3. Execute deletion
4. Clean up related data

## Service Integration

### Component Integration
```typescript
// Example hook usage
const { data, error, loading } = useQuery(
  () => mealService.getMealsByDate(selectedDate)
)
```

### Real-time Updates
```typescript
// Example subscription
const subscription = supabase
  .from('meals')
  .on('*', (payload) => {
    // Handle real-time update
  })
  .subscribe()
```

## Performance Optimization

### Caching Strategies
- In-memory caching for frequent requests
- Local storage for user preferences
- Supabase query caching

### Batch Operations
```typescript
// Example batch operation
export const createManyMeals = async (meals: Meal[]) => {
  const { data, error } = await supabase
    .from('meals')
    .insert(meals)
    .select()
  
  if (error) throw new ServiceError(
    error.message,
    'BATCH_INSERT_FAILED',
    500
  )
  
  return data
}
```

## Testing Considerations

### Mocking Services
```typescript
// Example mock service
export const mockMealService = {
  getMealsByDate: jest.fn(),
  createMeal: jest.fn(),
  // ... other methods
}
```

### Error Scenarios
- Network failures
- Database constraints
- Validation errors
- Authentication issues
