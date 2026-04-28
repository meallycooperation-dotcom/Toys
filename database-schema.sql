-- Database schema for Toys e-commerce app
-- Run this in Supabase SQL Editor

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery locations table
CREATE TABLE IF NOT EXISTS delivery_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample data
INSERT INTO products (name, description, price, stock_quantity) VALUES
('Toy Car', 'A fun red toy car', 25.99, 10),
('Doll', 'Beautiful doll with clothes', 19.99, 15),
('Building Blocks', '100 piece building set', 34.99, 8)
ON CONFLICT DO NOTHING;

INSERT INTO delivery_locations (name, value, price) VALUES
('Lagos', 'lagos', 5.00),
('Abuja', 'abuja', 7.00),
('Port Harcourt', 'portharcourt', 6.00)
ON CONFLICT (value) DO NOTHING;