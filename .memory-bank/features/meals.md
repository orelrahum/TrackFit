# Meal Tracking Feature

## Overview
The meal tracking system allows users to log their daily meals, track nutrients, and manage their food intake.

## Components

### MealList.tsx
- Main component for displaying daily meals
- Location: `src/components/MealList.tsx`
- Features:
  - Lists all meals for a selected date
  - Groups meals by type (breakfast, lunch, dinner, snacks)
  - Integrates with AddEditMealDialog for meal management

### MealItem.tsx
- Individual meal entry display
- Location: `src/components/MealItem.tsx`
- Features:
  - Shows meal details (name, portions, nutrients)
  - Edit/delete functionality
  - Nutrient breakdown

### AddEditMealDialog.tsx
- Modal dialog for creating/editing meals
- Location: `src/components/AddEditMealDialog.tsx`
- Features:
  - Food search functionality
  - Portion size adjustment
  - Nutrient calculation

## Services

### meal-service.ts
- Location: `src/lib/meal-service.ts`
- Responsibilities:
  - CRUD operations for meals
  - Daily meal summaries
  - Integration with Supabase

### food-service.ts
- Location: `src/lib/food-service.ts`
- Responsibilities:
  - Food database queries
  - Nutrient calculations
  - Food search functionality

### meal-utils.ts
- Location: `src/lib/meal-utils.ts`
- Helper functions for:
  - Nutrient calculations
  - Meal type categorization
  - Data formatting

## Database

### Food Database
- Location: `GOV_DB/food.csv`
- Contents:
  - Food items
  - Nutritional information
  - Portion sizes

### Database Schema
```sql
-- From migrations/00001_initial_schema.sql
-- Meals table structure and relationships
```

## Key Workflows

### Adding a Meal
1. User clicks "Add Meal" button
2. AddEditMealDialog opens
3. User searches for food items
4. User sets portion size
5. System calculates nutrients
6. Meal is saved to database

### Editing a Meal
1. User clicks edit on MealItem
2. AddEditMealDialog opens with existing data
3. User modifies meal details
4. Changes are saved to database

### Deleting a Meal
1. User clicks delete on MealItem
2. Confirmation dialog appears
3. Meal is removed from database

## Integration Points

### User Targets
- Meals contribute to daily nutrient targets
- Integration with ProgressBar and TargetSummary

### Daily Summary
- Meals are summarized in DailySummary component
- Total nutrients are calculated for the day

## Dependencies
- Supabase for data storage
- GOV_DB food database
- UI components from shadcn/ui
- Date handling libraries
