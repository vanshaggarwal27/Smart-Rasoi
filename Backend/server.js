require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Connected to Supabase PostgreSQL Database.');

// --- API Endpoints ---

// Dashboard Overview
app.get('/api/dashboard/overview', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch transactions with menu_items join
    const { data: txns, error: txnsError } = await supabase
      .from('transactions')
      .select('quantity, timestamp, menu_items(name, image_url, price)');

    if (txnsError) throw txnsError;

    // Fetch food waste with menu_items join
    const { data: waste, error: wasteError } = await supabase
      .from('food_waste')
      .select('quantity_wasted, date, menu_items(category)');

    if (wasteError) throw wasteError;

    // 1. totalTransactions
    const totalTransactions = txns.length;

    // 2. totalMealsToday
    let totalMealsToday = 0;
    txns.forEach(t => {
      const tDate = t.timestamp.split('T')[0];
      if (tDate === today) totalMealsToday += t.quantity;
    });

    // 3. wasteToday
    let wasteToday = 0;
    waste.forEach(w => {
      if (w.date === today) wasteToday += w.quantity_wasted;
    });

    // 4. popularItems
    const itemSales = {};
    txns.forEach(t => {
      if (t.menu_items) {
        const name = t.menu_items.name;
        if (!itemSales[name]) {
          itemSales[name] = { name, image_url: t.menu_items.image_url, price: Number(t.menu_items.price), sold: 0 };
        }
        itemSales[name].sold += t.quantity;
      }
    });
    const popularItems = Object.values(itemSales).sort((a, b) => b.sold - a.sold).slice(0, 5);

    // 5. dailyConsumption (last 7 days)
    const consumptionMap = {};
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const startDate = d.toISOString().split('T')[0];

    txns.forEach(t => {
      const tDate = t.timestamp.split('T')[0];
      if (tDate >= startDate) {
        consumptionMap[tDate] = (consumptionMap[tDate] || 0) + t.quantity;
      }
    });
    // Ensure all 7 days exist
    const dailyConsumption = [];
    for (let c = new Date(d); c <= new Date(); c.setDate(c.getDate() + 1)) {
        const dt = c.toISOString().split('T')[0];
        dailyConsumption.push({ date: dt.slice(5), meals: consumptionMap[dt] || 0 });
    }

    // 6. wasteByCategory
    const wasteCatMap = {};
    waste.forEach(w => {
      if (w.menu_items) {
        const cat = w.menu_items.category;
        wasteCatMap[cat] = (wasteCatMap[cat] || 0) + w.quantity_wasted;
      }
    });
    const wasteByCategory = Object.keys(wasteCatMap).map(k => ({ category: k, waste: wasteCatMap[k] }));

    res.json({
      totalMealsToday,
      totalTransactions,
      wasteToday,
      popularItems,
      dailyConsumption,
      wasteByCategory
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Menu Management
app.get('/api/menu', async (req, res) => {
  const { data, error } = await supabase.from('menu_items').select('*').order('id', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/menu', async (req, res) => {
  const { name, category, price, status, image_url } = req.body;
  const { data, error } = await supabase
    .from('menu_items')
    .insert([{ name, category, price, status, image_url }])
    .select();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.put('/api/menu/:id', async (req, res) => {
  const { name, category, price, status, image_url } = req.body;
  const { error } = await supabase
    .from('menu_items')
    .update({ name, category, price, status, image_url })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.delete('/api/menu/:id', async (req, res) => {
  const { error } = await supabase.from('menu_items').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Consumption Tracking (Transactions)
app.get('/api/transactions', async (req, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, student_id, quantity, total_price, meal_category, timestamp, menu_items(name)')
    .order('timestamp', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  
  // Flatten response
  const formatted = data.map(t => ({
    id: t.id,
    student_id: t.student_id,
    quantity: t.quantity,
    total_price: t.total_price,
    meal_category: t.meal_category,
    timestamp: t.timestamp,
    food_item: t.menu_items ? t.menu_items.name : 'Unknown'
  }));
  res.json(formatted);
});

app.get('/api/consumption/analytics', async (req, res) => {
  try {
    const { data: txns, error } = await supabase
      .from('transactions')
      .select('quantity, meal_category, menu_items(name)');
      
    if (error) throw error;

    // Pie Data
    const pieMap = {};
    txns.forEach(t => {
      pieMap[t.meal_category] = (pieMap[t.meal_category] || 0) + t.quantity;
    });
    const pieData = Object.keys(pieMap).map(k => ({ name: k, value: pieMap[k] }));

    // Bar Data (Top 10)
    const barMap = {};
    txns.forEach(t => {
      if (t.menu_items) {
        const name = t.menu_items.name;
        barMap[name] = (barMap[name] || 0) + t.quantity;
      }
    });
    const barData = Object.keys(barMap)
      .map(k => ({ name: k, sold: barMap[k] }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    res.json({ pieData, barData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Food Waste Tracking
app.get('/api/waste', async (req, res) => {
  const { data, error } = await supabase
    .from('food_waste')
    .select('id, quantity_prepared, quantity_sold, quantity_wasted, reason, date, menu_items(name)')
    .order('date', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  
  const formatted = data.map(w => ({
    id: w.id,
    quantity_prepared: w.quantity_prepared,
    quantity_sold: w.quantity_sold,
    quantity_wasted: w.quantity_wasted,
    reason: w.reason,
    date: w.date,
    food_item: w.menu_items ? w.menu_items.name : 'Unknown'
  }));
  res.json(formatted);
});

app.post('/api/waste', async (req, res) => {
  const { item_id, quantity_prepared, quantity_sold, quantity_wasted, reason, date } = req.body;
  const { data, error } = await supabase
    .from('food_waste')
    .insert([{ item_id, quantity_prepared, quantity_sold, quantity_wasted, reason, date }])
    .select();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data[0].id, success: true });
});

// Staff Management
app.get('/api/staff', async (req, res) => {
  const { data, error } = await supabase.from('users').select('id, name, email, role');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

const PORT = 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
