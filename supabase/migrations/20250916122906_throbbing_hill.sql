/*
  # Update Payment Modes for Razorpay Integration

  1. Changes
    - Remove 'whatsapp' from payment_mode options
    - Add 'razorpay' as a valid payment mode
    - Update existing whatsapp orders to cod (optional)

  2. Payment Modes
    - 'cod' (Cash on Delivery)
    - 'razorpay' (Online Payment via Razorpay)

  3. Security
    - Maintains existing RLS policies
    - No changes to permissions
*/

-- Drop the existing check constraint for payment_mode
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_mode_check;

-- Add a new check constraint for payment_mode to include 'cod' and 'razorpay'
ALTER TABLE orders ADD CONSTRAINT orders_payment_mode_check
  CHECK (payment_mode IN ('cod', 'razorpay'));

-- Optionally, update any existing 'whatsapp' payment_mode entries to 'cod'
-- Uncomment the line below if you want to convert existing whatsapp orders
-- UPDATE orders SET payment_mode = 'cod' WHERE payment_mode = 'whatsapp';