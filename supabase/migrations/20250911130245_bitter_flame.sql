/*
  # Create Orders Management System

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text, required)
      - `customer_phone` (text, required)
      - `customer_alternate_phone` (text, optional)
      - `customer_email` (text, optional)
      - `delivery_house_no` (text, required)
      - `delivery_landmark` (text, optional)
      - `delivery_city` (text, required)
      - `delivery_state` (text, required)
      - `delivery_pincode` (text, required)
      - `payment_mode` (text, required - 'cod' or 'whatsapp')
      - `total_amount` (numeric, required)
      - `delivery_charge` (numeric, required)
      - `order_items` (jsonb, required - stores product details)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `orders` table
    - Add policies for admin users based on email from environment
    - Admin can view, insert, update, and delete orders

  3. Notes
    - Replace 'aryan64871@gmail.com' with your actual admin email from .env
    - Order items stored as JSONB for historical accuracy
    - Status can be: pending, confirmed, shipped, delivered, cancelled
*/

-- Create the orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_alternate_phone text,
  customer_email text,
  delivery_house_no text NOT NULL,
  delivery_landmark text,
  delivery_city text NOT NULL,
  delivery_state text NOT NULL,
  delivery_pincode text NOT NULL,
  payment_mode text NOT NULL CHECK (payment_mode IN ('cod', 'whatsapp')),
  total_amount numeric NOT NULL,
  delivery_charge numeric NOT NULL,
  order_items jsonb NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS) on the orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated admin users to view all orders
-- Replace 'aryan64871@gmail.com' with your actual admin email from .env
CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    auth.email() = 'aryan64871@gmail.com'
  );

-- Policy for authenticated admin users to insert orders
CREATE POLICY "Admins can insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.email() = 'aryan64871@gmail.com'
  );

-- Policy for authenticated admin users to update orders
CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    auth.email() = 'aryan64871@gmail.com'
  );

-- Policy for authenticated admin users to delete orders
CREATE POLICY "Admins can delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (
    auth.email() = 'aryan64871@gmail.com'
  );

-- Policy to allow public insertion of orders (for customer orders)
-- This allows the frontend to insert orders without authentication
CREATE POLICY "Allow public order insertion"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);