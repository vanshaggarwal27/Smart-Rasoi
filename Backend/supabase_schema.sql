-- PostgreSQL Schema for Smart Cafeteria Dashboard

-- 1. Create Users Table
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    password_hash TEXT NOT NULL
);

-- 2. Create Menu Items Table
CREATE TABLE public.menu_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL,
    image_url TEXT
);

-- 3. Create Transactions Table
CREATE TABLE public.transactions (
    id SERIAL PRIMARY KEY,
    student_id TEXT NOT NULL,
    item_id INTEGER REFERENCES public.menu_items(id),
    quantity INTEGER NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    meal_category TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Food Waste Table
CREATE TABLE public.food_waste (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES public.menu_items(id),
    quantity_prepared INTEGER NOT NULL,
    quantity_sold INTEGER NOT NULL,
    quantity_wasted INTEGER NOT NULL,
    reason TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL
);

-- 5. Insert Initial Data: Users
INSERT INTO public.users (name, email, role, password_hash) VALUES 
('Admin User', 'admin@university.edu', 'Admin', 'dummy_hash'),
('Manager Alice', 'alice@university.edu', 'Manager', 'dummy_hash'),
('Staff Bob', 'bob@university.edu', 'Staff', 'dummy_hash');

-- 6. Insert Initial Data: Menu Items (INR Adjusted Prices)
INSERT INTO public.menu_items (name, category, price, status, image_url) VALUES 
('Grilled Chicken Salad', 'Lunch', 680.00, 'available', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'),
('Classic Cheeseburger', 'Lunch', 480.00, 'available', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60'),
('Margherita Pizza', 'Dinner', 720.00, 'available', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60'),
('Avocado Toast', 'Breakfast', 440.00, 'available', 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=500&auto=format&fit=crop&q=60'),
('Pancakes with Syrup', 'Breakfast', 360.00, 'available', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=500&auto=format&fit=crop&q=60'),
('Latte Coffee', 'Beverage', 280.00, 'available', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&auto=format&fit=crop&q=60'),
('Vegan Buddha Bowl', 'Lunch', 760.00, 'available', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60'),
('Spaghetti Carbonara', 'Dinner', 640.00, 'available', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&auto=format&fit=crop&q=60');

-- 7. Insert Dummy Transactions (Last 7 Days)
DO $$
DECLARE
    m_id INTEGER;
    m_price NUMERIC(10,2);
    m_cat TEXT;
    qty INTEGER;
    t_price NUMERIC(10,2);
    m_meal_cat TEXT;
    s_id TEXT;
    rand_days INTEGER;
    t_date TIMESTAMP WITH TIME ZONE;
BEGIN
    FOR i IN 1..150 LOOP
        s_id := 'STU' || floor(random() * 9000 + 1000)::text;
        m_id := floor(random() * 8) + 1;
        
        SELECT category, price INTO m_cat, m_price FROM public.menu_items WHERE id = m_id;
        
        qty := floor(random() * 3) + 1;
        t_price := qty * m_price;
        
        IF m_cat = 'Beverage' THEN
            m_meal_cat := 'Break';
        ELSE
            m_meal_cat := m_cat;
        END IF;

        rand_days := floor(random() * 7);
        t_date := now() - (rand_days || ' days')::interval;
        
        INSERT INTO public.transactions (student_id, item_id, quantity, total_price, meal_category, timestamp)
        VALUES (s_id, m_id, qty, t_price, m_meal_cat, t_date);
    END LOOP;
END $$;

-- 8. Insert Dummy Food Waste (Last 7 Days)
DO $$
DECLARE
    m_id INTEGER;
    q_prep INTEGER;
    q_sold INTEGER;
    q_waste INTEGER;
    rand_days INTEGER;
    w_date DATE;
    reason_arr TEXT[] := ARRAY['Overproduction', 'Spoiled/Expired', 'Dropped/Accident'];
    w_reason TEXT;
BEGIN
    FOR i IN 1..30 LOOP
        m_id := floor(random() * 8) + 1;
        q_prep := floor(random() * 50) + 20;
        q_sold := q_prep - (floor(random() * 15))::INT;
        q_waste := q_prep - q_sold;
        
        IF q_waste > 0 THEN
            rand_days := floor(random() * 7);
            w_date := CURRENT_DATE - (rand_days || ' days')::interval;
            w_reason := reason_arr[floor(random() * 3) + 1];
            
            INSERT INTO public.food_waste (item_id, quantity_prepared, quantity_sold, quantity_wasted, reason, date)
            VALUES (m_id, q_prep, q_sold, q_waste, w_reason, w_date);
        END IF;
    END LOOP;
END $$;
