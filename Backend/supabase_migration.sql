-- ============================================================
-- Smart Rasoi: Full Supabase Migration
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Drop and recreate menu_items with all columns (including nutrition)
DROP TABLE IF EXISTS public.food_waste;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.menu_items;
DROP TABLE IF EXISTS public.users;

-- 1. Users Table
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    password_hash TEXT NOT NULL
);

-- 2. Menu Items Table (with nutrition columns)
CREATE TABLE public.menu_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'available',
    image_url TEXT,
    calories INTEGER DEFAULT 0,
    protein NUMERIC(6,2) DEFAULT 0,
    carbs NUMERIC(6,2) DEFAULT 0,
    fats NUMERIC(6,2) DEFAULT 0
);

-- 3. Transactions Table
CREATE TABLE public.transactions (
    id SERIAL PRIMARY KEY,
    student_id TEXT NOT NULL,
    item_id INTEGER REFERENCES public.menu_items(id),
    quantity INTEGER NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    meal_category TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Food Waste Table
CREATE TABLE public.food_waste (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES public.menu_items(id),
    quantity_prepared INTEGER NOT NULL,
    quantity_sold INTEGER NOT NULL,
    quantity_wasted INTEGER NOT NULL,
    reason TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL
);

-- 5. Disable RLS (so frontend can read/write without auth)
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_waste ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.food_waste FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- 6. Seed Users
INSERT INTO public.users (name, email, role, password_hash) VALUES 
('Admin User', 'admin@university.edu', 'Admin', 'dummy_hash'),
('Manager Alice', 'alice@university.edu', 'Manager', 'dummy_hash'),
('Staff Bob', 'bob@university.edu', 'Staff', 'dummy_hash');

-- 7. Seed Menu Items (Indian Cafeteria)
INSERT INTO public.menu_items (name, category, price, status, image_url, calories, protein, carbs, fats) VALUES
('Masala Dosa', 'Breakfast', 60.00, 'available', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60', 350, 8, 55, 10),
('Poha', 'Breakfast', 40.00, 'available', 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=500&auto=format&fit=crop&q=60', 250, 5, 45, 6),
('Idli Sambhar', 'Breakfast', 50.00, 'available', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60', 200, 6, 40, 3),
('Veg Biryani', 'Lunch', 120.00, 'available', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=60', 450, 10, 70, 12),
('Dal Makhani + Roti', 'Lunch', 90.00, 'available', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60', 400, 14, 55, 11),
('Paneer Butter Masala', 'Dinner', 140.00, 'available', 'https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=500&auto=format&fit=crop&q=60', 380, 16, 30, 22),
('Chicken Curry + Rice', 'Dinner', 160.00, 'available', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60', 520, 30, 50, 18),
('Masala Chai', 'Beverage', 20.00, 'available', 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=500&auto=format&fit=crop&q=60', 80, 2, 14, 2),
('Cold Coffee', 'Beverage', 60.00, 'available', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&auto=format&fit=crop&q=60', 150, 4, 28, 4),
('Samosa (2 pcs)', 'Breakfast', 30.00, 'available', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=60', 180, 4, 22, 9);
