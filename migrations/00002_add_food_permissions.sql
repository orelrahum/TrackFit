-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."foods";
DROP POLICY IF EXISTS "Enable insert for measurement units" ON "public"."food_measurement_units";

-- Allow authenticated users to insert into foods table
CREATE POLICY "Enable insert for authenticated users" ON "public"."foods"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to insert into food_measurement_units table
CREATE POLICY "Enable insert for measurement units" ON "public"."food_measurement_units"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- Grant insert privileges to authenticated users
GRANT INSERT ON "public"."foods" TO authenticated;
GRANT INSERT ON "public"."food_measurement_units" TO authenticated;
