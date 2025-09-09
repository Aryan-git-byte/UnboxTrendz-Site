/*
  # Transform to Email Authentication System for UnboxTrendz

  1. Changes
    - Drop phone-based admin_users table
    - Create new email-based admin_users table
    - Insert admin user with email aryan64871@gmail.com
    - Update products table references if needed

  2. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique, references auth.users.email)
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on admin_users table
    - Add policy for authenticated admin users
*/

-- Drop existing phone-based admin_users table
DROP TABLE IF EXISTS admin_users CASCADE;

-- Create new email-based admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to read their own data
CREATE POLICY "Admin users can read own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Insert the admin user
INSERT INTO admin_users (email) VALUES ('aryan64871@gmail.com')
ON CONFLICT (email) DO NOTHING;