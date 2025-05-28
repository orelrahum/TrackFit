# Database Documentation

## Overview
The application uses Supabase as the backend database service, with PostgreSQL as the underlying database engine.

## Database Schema

### Users Table
```sql
create table users (
  id uuid references auth.users primary key,
  email text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### User Targets Table
```sql
create table user_targets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  calories numeric,
  protein numeric,
  carbs numeric,
  fat numeric,
  water numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint user_targets_user_id_unique unique (user_id)
);
```

### Meals Table
```sql
create table meals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  food_id text not null,
  portion_size numeric not null,
  meal_type text not null,
  calories numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Water Intake Table
```sql
create table water_intake (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  amount numeric not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Row Level Security (RLS) Policies

### Users Table
```sql
-- Allow users to read their own data
create policy "Users can read own data" on users
  for select using (auth.uid() = id);

-- Allow users to update their own data
create policy "Users can update own data" on users
  for update using (auth.uid() = id);
```

### User Targets Table
```sql
-- Allow users to manage their own targets
create policy "Users can manage own targets" on user_targets
  for all using (auth.uid() = user_id);
```

### Meals Table
```sql
-- Allow users to manage their own meals
create policy "Users can manage own meals" on meals
  for all using (auth.uid() = user_id);
```

### Water Intake Table
```sql
-- Allow users to manage their own water intake
create policy "Users can manage own water intake" on water_intake
  for all using (auth.uid() = user_id);
```

## Indexes

### Performance Optimization Indexes
```sql
-- Meals table indexes
create index meals_user_id_date_idx on meals(user_id, date);
create index meals_date_idx on meals(date);

-- Water intake indexes
create index water_intake_user_id_date_idx on water_intake(user_id, date);
create index water_intake_date_idx on water_intake(date);
```

## Database Functions

### Calculate Daily Totals
```sql
create or replace function get_daily_totals(
  p_user_id uuid,
  p_date date
) returns table (
  total_calories numeric,
  total_protein numeric,
  total_carbs numeric,
  total_fat numeric,
  total_water numeric
) language plpgsql as $$
begin
  return query
    select 
      coalesce(sum(m.calories), 0) as total_calories,
      coalesce(sum(m.protein), 0) as total_protein,
      coalesce(sum(m.carbs), 0) as total_carbs,
      coalesce(sum(m.fat), 0) as total_fat,
      coalesce(sum(w.amount), 0) as total_water
    from meals m
    left join water_intake w on 
      w.user_id = m.user_id and 
      w.date = m.date
    where 
      m.user_id = p_user_id and 
      m.date = p_date;
end;
$$;
```

## Backup and Recovery

### Automated Backups
- Daily backups via Supabase
- Point-in-time recovery available
- 30-day retention period

### Disaster Recovery
1. Full database backup available
2. Transaction logs for point-in-time recovery
3. Automated failover in case of issues

## Security Measures

### Access Control
- Row Level Security (RLS) enabled on all tables
- User-specific data isolation
- JWT token validation

### Data Encryption
- Data at rest encryption
- SSL/TLS for data in transit
- Secure connection strings

## Data Migration

### Migration Files
- Location: `migrations/`
- Version controlled schema changes
- Repeatable migrations for testing
