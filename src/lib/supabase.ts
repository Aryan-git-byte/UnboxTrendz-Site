import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  images: string[];
  visible: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_alternate_phone?: string;
  customer_email?: string;
  delivery_house_no: string;
  delivery_landmark?: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  payment_mode: 'cod' | 'whatsapp';
  total_amount: number;
  delivery_charge: number;
  order_items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
    images?: string[];
  }>;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
};