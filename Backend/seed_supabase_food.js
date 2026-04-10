require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const foodItems = [
  // ── Breakfast ──────────────────────────────────────────────────────────────
  { name: 'Masala Dosa',       category: 'Breakfast', calories: 280, protein: 7.0,  carbs: 45.0, fats: 8.0,  price: 120.0, is_available: true },
  { name: 'Aloo Paratha',      category: 'Breakfast', calories: 310, protein: 8.0,  carbs: 48.0, fats: 12.0, price: 60.0,  is_available: true },
  { name: 'Idli Sambar',       category: 'Breakfast', calories: 200, protein: 6.0,  carbs: 38.0, fats: 3.5,  price: 50.0,  is_available: true },
  { name: 'Poha',              category: 'Breakfast', calories: 250, protein: 5.0,  carbs: 40.0, fats: 6.0,  price: 40.0,  is_available: true },
  { name: 'Upma',              category: 'Breakfast', calories: 220, protein: 5.5,  carbs: 36.0, fats: 5.0,  price: 35.0,  is_available: true },
  { name: 'Medu Vada',         category: 'Breakfast', calories: 230, protein: 6.0,  carbs: 28.0, fats: 10.0, price: 45.0,  is_available: true },

  // ── Lunch ──────────────────────────────────────────────────────────────────
  { name: 'Paneer Butter Masala', category: 'Lunch',  calories: 420, protein: 14.0, carbs: 12.0, fats: 35.0, price: 160.0, is_available: true },
  { name: 'Veg Biryani',          category: 'Lunch',  calories: 350, protein: 8.0,  carbs: 55.0, fats: 10.0, price: 180.0, is_available: true },
  { name: 'Chole Bhature',        category: 'Lunch',  calories: 510, protein: 12.0, carbs: 62.0, fats: 25.0, price: 110.0, is_available: true },
  { name: 'Rajma Chawal',         category: 'Lunch',  calories: 380, protein: 15.0, carbs: 70.0, fats: 5.0,  price: 90.0,  is_available: true },
  { name: 'Veg Pulao',            category: 'Lunch',  calories: 290, protein: 6.0,  carbs: 50.0, fats: 7.0,  price: 130.0, is_available: true },
  { name: 'Dal Tadka + Roti',     category: 'Lunch',  calories: 340, protein: 13.0, carbs: 55.0, fats: 8.0,  price: 80.0,  is_available: true },
  { name: 'Palak Paneer',         category: 'Lunch',  calories: 390, protein: 16.0, carbs: 14.0, fats: 30.0, price: 150.0, is_available: true },
  { name: 'Chicken Biryani',      category: 'Lunch',  calories: 490, protein: 28.0, carbs: 52.0, fats: 18.0, price: 220.0, is_available: true },
  { name: 'Mutton Curry + Rice',  category: 'Lunch',  calories: 560, protein: 32.0, carbs: 48.0, fats: 22.0, price: 280.0, is_available: false },

  // ── Snacks ─────────────────────────────────────────────────────────────────
  { name: 'Samosa',            category: 'Snack',     calories: 260, protein: 4.0,  carbs: 32.0, fats: 14.0, price: 20.0,  is_available: true },
  { name: 'Pav Bhaji',         category: 'Snack',     calories: 400, protein: 10.0, carbs: 55.0, fats: 18.0, price: 100.0, is_available: true },
  { name: 'Vada Pav',          category: 'Snack',     calories: 320, protein: 7.0,  carbs: 45.0, fats: 12.0, price: 30.0,  is_available: true },
  { name: 'Dhokla',            category: 'Snack',     calories: 180, protein: 6.0,  carbs: 28.0, fats: 4.0,  price: 50.0,  is_available: true },
  { name: 'Bhel Puri',         category: 'Snack',     calories: 200, protein: 5.0,  carbs: 35.0, fats: 5.0,  price: 40.0,  is_available: true },
  { name: 'Bread Pakora',      category: 'Snack',     calories: 290, protein: 6.0,  carbs: 38.0, fats: 13.0, price: 35.0,  is_available: true },

  // ── Dinner ─────────────────────────────────────────────────────────────────
  { name: 'Paneer Tikka Masala', category: 'Dinner',  calories: 440, protein: 18.0, carbs: 15.0, fats: 34.0, price: 180.0, is_available: true },
  { name: 'Egg Curry + Rice',    category: 'Dinner',  calories: 450, protein: 22.0, carbs: 50.0, fats: 16.0, price: 140.0, is_available: true },
  { name: 'Aloo Gobi Sabzi',     category: 'Dinner',  calories: 280, protein: 6.0,  carbs: 38.0, fats: 10.0, price: 90.0,  is_available: true },
  { name: 'Mix Veg Thali',       category: 'Dinner',  calories: 520, protein: 14.0, carbs: 70.0, fats: 15.0, price: 150.0, is_available: true },

  // ── Beverages ──────────────────────────────────────────────────────────────
  { name: 'Masala Chai',       category: 'Beverage',  calories: 120, protein: 3.0,  carbs: 18.0, fats: 4.0,  price: 15.0,  is_available: true },
  { name: 'Filter Coffee',     category: 'Beverage',  calories: 90,  protein: 2.0,  carbs: 15.0, fats: 3.0,  price: 20.0,  is_available: true },
  { name: 'Lassi (Sweet)',     category: 'Beverage',  calories: 220, protein: 8.0,  carbs: 35.0, fats: 5.0,  price: 60.0,  is_available: true },
  { name: 'Buttermilk (Chaas)',category: 'Beverage',  calories: 60,  protein: 4.0,  carbs: 8.0,  fats: 1.0,  price: 15.0,  is_available: true },
  { name: 'Fresh Lime Soda',   category: 'Beverage',  calories: 50,  protein: 0.5,  carbs: 12.0, fats: 0.0,  price: 30.0,  is_available: true },
  { name: 'Sugarcane Juice',   category: 'Beverage',  calories: 180, protein: 0.5,  carbs: 45.0, fats: 0.0,  price: 40.0,  is_available: true },
];

async function seedFoodItems() {
  console.log(`\n🌱 Seeding ${foodItems.length} items into food_items table...\n`);

  // Optional: clear existing rows first so you don't get duplicates on re-run
  const { error: deleteError } = await supabase
    .from('food_items')
    .delete()
    .neq('food_id', 0); // deletes all rows

  if (deleteError) {
    console.warn('⚠️  Could not clear existing rows:', deleteError.message);
  } else {
    console.log('🗑️  Cleared existing food_items rows.');
  }

  // Insert all items
  const { data, error } = await supabase
    .from('food_items')
    .insert(foodItems)
    .select();

  if (error) {
    console.error('❌ Insert failed:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully inserted ${data.length} food items!\n`);
  data.forEach(item =>
    console.log(`   [${item.food_id}] ${item.name} (${item.category}) — ₹${item.price}`)
  );
  console.log('\n🎉 Done!');
}

seedFoodItems();
