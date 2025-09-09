/*
  # Update product categories for TRENDOCART

  1. Changes
    - Update the category constraint to include new categories: Toys, Gifts, Kitchen & Home decor, Jewellery, Gadgets, Stationery
    - Remove old constraint and add new one with updated categories

  2. Security
    - Maintains existing RLS policies
    - No changes to permissions
*/

-- Drop the existing constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- Add new constraint with updated categories
ALTER TABLE products ADD CONSTRAINT products_category_check 
  CHECK (category = ANY (ARRAY['Toys'::text, 'Gifts'::text, 'Kitchen & Home decor'::text, 'Jewellery'::text, 'Gadgets'::text, 'Stationery'::text]));