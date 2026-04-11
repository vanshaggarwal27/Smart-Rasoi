const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://siwksyjnxfscxylrgyyk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("No Service Role Key found. Please add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const MOCK_STUDENTS = [
  'VANSH27102005', 'HALFBLOOD0105', 'SHIVANGI24', 'ADITYA99', 'RIYA123'
];

const MOCK_ITEMS = [
  'Paneer Butter Masala x1', 'Masala Chai x3', 'Aloo Paratha x2', 'Veg Biryani x1', 'Chole Bhature x1'
];

async function createOrder() {
  const studentId = MOCK_STUDENTS[Math.floor(Math.random() * MOCK_STUDENTS.length)];
  const items = MOCK_ITEMS[Math.floor(Math.random() * MOCK_ITEMS.length)];
  const amount = Math.floor(Math.random() * 500) + 50;

  console.log(`🚀 Creating simulated order for ${studentId}...`);

  const { data, error } = await supabase
    .from('orders')
    .insert({
      student_id: studentId,
      food_items: items,
      total_amount: amount,
      order_time: new Date().toISOString(),
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Error creating order:", error.message);
  } else {
    console.log(`✅ Success! Order #${data.order_id} created.`);
  }
}

// Create an order every 15 seconds for demonstration
console.log("🔥 Order Simulation Started. Creating a new order every 15s...");
createOrder();
setInterval(createOrder, 15000);
