# Database Migrations

This directory contains the database schema migrations for setting up a local Supabase instance.

## Schema Overview

The database schema includes the following tables:
- `user_profiles` - User profile information like height, weight, age, etc.
- `user_targets` - Daily nutritional targets for users
- `foods` - Food items database with nutritional information
- `food_measurement_units` - Different measurement units for foods
- `meal_groups` - Groups of meals for specific dates
- `meals` - Individual meal entries with nutritional information
- `water_logs` - Water intake tracking

## Setting Up Local Supabase

1. Install Supabase CLI if you haven't already:
```bash
npm install -g supabase
```

2. Start a local Supabase instance:
```bash
supabase init
supabase start
```

3. Apply the migrations:
```bash
supabase db reset
```

This will:
- Create all required tables
- Set up Row Level Security (RLS) policies
- Create necessary indexes for optimal performance
- Enable required extensions (uuid-ossp, pgcrypto, pgjwt)

## Important Notes

- The schema references `auth.users` table which is automatically created by Supabase
- All tables have Row Level Security (RLS) enabled with appropriate policies
- Foreign key relationships are set up between tables
- Indexes are created for frequently queried columns
- Timestamps are automatically managed using `now()` defaults

## Folder Structure

```
migrations/
├── 00001_initial_schema.sql   # Base schema with tables, RLS, and indexes
└── README.md                  # This file
