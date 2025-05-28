# TrackFit Project Overview

This is a React/TypeScript fitness tracking application that helps users monitor their meals, water intake, and fitness targets.

## Project Structure

```
src/
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── auth/          # Authentication components
├── context/           # React context providers
├── hooks/             # Custom React hooks
├── lib/               # Services and utilities
├── pages/             # Page components
│   └── auth/          # Auth-related pages
└── types/             # TypeScript type definitions

public/               # Static assets
GOV_DB/              # Food database files
migrations/          # Database migrations
scripts/             # Import scripts
```

## Key Features

### 1. Meal Tracking
- Components: MealList, MealItem, AddEditMealDialog
- Services: meal-service.ts, food-service.ts
- Database: food.csv for food database

### 2. Water Tracking
- Component: WaterTracker
- Service: water-service.ts

### 3. Progress Tracking
- Components: ProgressBar, TargetSummary, NutrientChart
- Service: target-service.ts

### 4. Authentication
- Components: ProtectedRoute
- Pages: Login, Callback
- Service: supabase.ts for auth integration

## Technical Stack

1. **Frontend**
   - React with TypeScript
   - Tailwind CSS for styling
   - Shadcn UI components

2. **Backend**
   - Supabase for:
     - Authentication
     - Database
     - Real-time features

3. **Development Tools**
   - Vite as build tool
   - ESLint for linting
   - PostCSS for CSS processing

## Key Files

- `src/App.tsx`: Main application component
- `src/lib/supabase.ts`: Supabase client configuration
- `migrations/00001_initial_schema.sql`: Database schema
- `scripts/import-food.js`: Food database import utility

## Project Setup

1. Environment Configuration
   - `.env.example`: Template for environment variables
   - Required Supabase configuration

2. Database
   - Food database from GOV_DB/
   - Custom migrations in migrations/

3. Build Configuration
   - `vite.config.ts`: Vite configuration
   - `tailwind.config.ts`: Tailwind CSS configuration
   - `tsconfig.json`: TypeScript configuration

See the detailed documentation in the relevant subdirectories for more information about specific features and components.
