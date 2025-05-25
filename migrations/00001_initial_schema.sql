-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA extensions;

-- Create tables
CREATE TABLE "public"."user_profiles" (
    "id" uuid NOT NULL,
    "height" numeric,
    "age" integer,
    "gender" text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text])),
    "activity_level" text,
    "weight_goal" text,
    "weight_rate" numeric,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    "weight" numeric NOT NULL DEFAULT 0,
    "target_weight" numeric NOT NULL DEFAULT 0,
    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE "public"."user_targets" (
    "user_id" uuid NOT NULL,
    "calories" integer NOT NULL,
    "protein" integer NOT NULL,
    "carbs" integer NOT NULL,
    "fat" integer NOT NULL,
    "updated_at" timestamptz DEFAULT now(),
    "created_at" timestamptz DEFAULT now(),
    CONSTRAINT "user_targets_pkey" PRIMARY KEY ("user_id"),
    CONSTRAINT "user_targets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE "public"."foods" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name_he" text NOT NULL,
    "name_en" text NOT NULL,
    "calories" numeric NOT NULL,
    "protein" numeric NOT NULL,
    "fat" numeric NOT NULL,
    "carbs" numeric NOT NULL,
    "image_url" text,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."food_measurement_units" (
    "food_id" uuid NOT NULL,
    "unit" text NOT NULL,
    "grams" numeric NOT NULL,
    CONSTRAINT "food_measurement_units_pkey" PRIMARY KEY ("food_id", "unit"),
    CONSTRAINT "food_measurement_units_food_id_fkey" FOREIGN KEY (food_id) REFERENCES foods(id)
);

CREATE TABLE "public"."meal_groups" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "date" date NOT NULL,
    "name" text NOT NULL,
    "created_at" timestamptz DEFAULT now(),
    CONSTRAINT "meal_groups_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "meal_groups_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE "public"."meals" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "meal_group_id" uuid,
    "food_id" uuid,
    "name" text NOT NULL,
    "calories" numeric NOT NULL,
    "protein" numeric NOT NULL,
    "carbs" numeric NOT NULL,
    "fat" numeric NOT NULL,
    "weight" numeric NOT NULL,
    "unit" text NOT NULL,
    "image_url" text,
    "created_at" timestamptz DEFAULT now(),
    CONSTRAINT "meals_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "meals_meal_group_id_fkey" FOREIGN KEY (meal_group_id) REFERENCES meal_groups(id),
    CONSTRAINT "meals_food_id_fkey" FOREIGN KEY (food_id) REFERENCES foods(id)
);

CREATE TABLE "public"."water_logs" (
    "id" uuid DEFAULT uuid_generate_v4() NOT NULL,
    "user_id" uuid NOT NULL,
    "date" date NOT NULL,
    "amount" numeric NOT NULL,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "water_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "water_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_targets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."foods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."food_measurement_units" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."meal_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."meals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."water_logs" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Enable read access for authenticated users" ON "public"."foods"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for authenticated users" ON "public"."food_measurement_units"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable read access for own profile" ON "public"."user_profiles"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable insert access for own profile" ON "public"."user_profiles"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update access for own profile" ON "public"."user_profiles"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access for own targets" ON "public"."user_targets"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for own targets" ON "public"."user_targets"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for own targets" ON "public"."user_targets"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for own meal groups" ON "public"."meal_groups"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for own meal groups" ON "public"."meal_groups"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for own meal groups" ON "public"."meal_groups"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for own meals" ON "public"."meals"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  meal_group_id IN (
    SELECT id FROM meal_groups WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for own meals" ON "public"."meals"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  meal_group_id IN (
    SELECT id FROM meal_groups WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for own meals" ON "public"."meals"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  meal_group_id IN (
    SELECT id FROM meal_groups WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Enable read access for own water logs" ON "public"."water_logs"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for own water logs" ON "public"."water_logs"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own water logs" ON "public"."water_logs"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for own water logs" ON "public"."water_logs"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS meal_groups_user_id_date_idx ON meal_groups(user_id, date);
CREATE INDEX IF NOT EXISTS meals_meal_group_id_idx ON meals(meal_group_id);
CREATE INDEX IF NOT EXISTS water_logs_user_id_date_idx ON water_logs(user_id, date);
CREATE INDEX IF NOT EXISTS food_measurement_units_food_id_idx ON food_measurement_units(food_id);
