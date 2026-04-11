const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'cafeteria.db');
const db = new sqlite3.Database(dbPath);

console.log('Clearing old data and seeding DB...');

db.serialize(() => {
  // Drop existing tables
  db.run(`DROP TABLE IF EXISTS users`);
  db.run(`DROP TABLE IF EXISTS menu_items`);
  db.run(`DROP TABLE IF EXISTS transactions`);
  db.run(`DROP TABLE IF EXISTS food_waste`);
  
  // 1. Create tables
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    role TEXT,
    password_hash TEXT
  )`);

  db.run(`CREATE TABLE menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    price REAL,
    status TEXT,
    image_url TEXT,
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fats INTEGER
  )`);

  db.run(`CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT,
    item_id INTEGER,
    quantity INTEGER,
    total_price REAL,
    meal_category TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(item_id) REFERENCES menu_items(id)
  )`);

  db.run(`CREATE TABLE food_waste (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    quantity_prepared INTEGER,
    quantity_sold INTEGER,
    quantity_wasted INTEGER,
    reason TEXT,
    date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY(item_id) REFERENCES menu_items(id)
  )`);

  // 2. Insert dummy users
  const insertUser = db.prepare(`INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)`);
  insertUser.run('Admin User', 'admin@university.edu', 'Admin', 'dummy_hash');
  insertUser.run('Manager Alice', 'alice@university.edu', 'Manager', 'dummy_hash');
  insertUser.run('Staff Bob', 'bob@university.edu', 'Staff', 'dummy_hash');
  insertUser.finalize();

  // 3. Insert real-looking food items with high quality Unsplash URLs
  const insertMenu = db.prepare(`INSERT INTO menu_items (name, category, price, status, image_url, calories, protein, carbs, fats) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  const menuList = [
    { name: 'Masala Dosa', category: 'Breakfast', price: 120, status: 'available', image_url: 'https://images.unsplash.com/photo-1668236543090-52ee0101295b?w=800&auto=format&fit=crop', calories: 280, protein: 7, carbs: 45, fats: 8 },
    { name: 'Paneer Butter Masala', category: 'Lunch', price: 160, status: 'available', image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop', calories: 420, protein: 14, carbs: 12, fats: 35 },
    { name: 'Veg Biryani', category: 'Lunch', price: 180, status: 'available', image_url: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=800&auto=format&fit=crop', calories: 350, protein: 8, carbs: 55, fats: 10 },
    { name: 'Chole Bhature', category: 'Lunch', price: 110, status: 'available', image_url: 'https://images.unsplash.com/photo-1596797038558-9daa3f8b59ee?w=800&auto=format&fit=crop', calories: 510, protein: 12, carbs: 62, fats: 25 },
    { name: 'Rajma Chawal', category: 'Lunch', price: 90, status: 'available', image_url: 'https://images.unsplash.com/photo-1664115163032-47535b91f16c?w=800&auto=format&fit=crop', calories: 380, protein: 15, carbs: 70, fats: 5 },
    { name: 'Samosa', category: 'Snack', price: 20, status: 'available', image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop', calories: 260, protein: 4, carbs: 32, fats: 14 },
    { name: 'Aloo Paratha', category: 'Breakfast', price: 60, status: 'available', image_url: 'https://images.unsplash.com/photo-1626776878841-f51393847aa3?w=800&auto=format&fit=crop', calories: 310, protein: 8, carbs: 48, fats: 12 },
    { name: 'Pav Bhaji', category: 'Snack', price: 100, status: 'available', image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&auto=format&fit=crop', calories: 400, protein: 10, carbs: 55, fats: 18 },
    { name: 'Veg Pulao', category: 'Lunch', price: 130, status: 'available', image_url: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=800&auto=format&fit=crop', calories: 290, protein: 6, carbs: 50, fats: 7 },
    { name: 'Masala Chai', category: 'Beverage', price: 40, status: 'available', image_url: 'https://images.unsplash.com/photo-1594631252845-29fc45862d6c?w=800&auto=format&fit=crop', calories: 120, protein: 3, carbs: 18, fats: 4 },
    { name: 'Filter Coffee', category: 'Beverage', price: 50, status: 'available', image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop', calories: 90, protein: 2, carbs: 15, fats: 3 },
    { name: 'Lassi', category: 'Beverage', price: 60, status: 'available', image_url: 'https://images.unsplash.com/photo-1630985223075-efb9e1458e0a?w=800&auto=format&fit=crop', calories: 220, protein: 8, carbs: 35, fats: 5 },
    { name: 'Buttermilk', category: 'Beverage', price: 30, status: 'available', image_url: 'https://images.unsplash.com/photo-1626154316986-e30d9703f8a0?w=800&auto=format&fit=crop', calories: 60, protein: 4, carbs: 8, fats: 1 }
  ];

  menuList.forEach(m => insertMenu.run(m.name, m.category, m.price, m.status, m.image_url, m.calories, m.protein, m.carbs, m.fats));
  insertMenu.finalize();

  // 4. Generate random transactions over the last 7 days
  const insertTransaction = db.prepare(`INSERT INTO transactions (student_id, item_id, quantity, total_price, meal_category, timestamp) VALUES (?, ?, ?, ?, ?, ?)`);
  
  for(let i=0; i<150; i++) {
    const student_id = 'STU' + Math.floor(Math.random() * 9000 + 1000);
    const item_id = Math.floor(Math.random() * menuList.length) + 1; // 1 to 8
    const m = menuList[item_id - 1];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const total_price = quantity * m.price;
    const meal_category = m.category === 'Beverage' ? 'Break' : m.category;
    
    // Random past dates for 7 days
    const pastDays = Math.floor(Math.random() * 7);
    const d = new Date();
    d.setDate(d.getDate() - pastDays);
    // Add random hours from 8AM to 8PM
    d.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
    
    insertTransaction.run(student_id, item_id, quantity, total_price, meal_category, d.toISOString());
  }
  insertTransaction.finalize();

  // 5. Generate random waste tracking daily data (last 7 days)
  const insertWaste = db.prepare(`INSERT INTO food_waste (item_id, quantity_prepared, quantity_sold, quantity_wasted, reason, date) VALUES (?, ?, ?, ?, ?, ?)`);
  
  const reasons = ['Overproduction', 'Spoiled/Expired', 'Dropped/Accident'];
  for(let i=0; i<30; i++) {
    const item_id = Math.floor(Math.random() * menuList.length) + 1;
    const quantity_prepared = Math.floor(Math.random() * 50) + 20;
    const quantity_sold = quantity_prepared - Math.floor(Math.random() * 15);
    const quantity_wasted = quantity_prepared - quantity_sold;
    
    if (quantity_wasted > 0) {
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      const pastDays = Math.floor(Math.random() * 7);
      const d = new Date();
      d.setDate(d.getDate() - pastDays);
      const dateStr = d.toISOString().split('T')[0];
      
      insertWaste.run(item_id, quantity_prepared, quantity_sold, quantity_wasted, reason, dateStr);
    }
  }
  insertWaste.finalize();
  
  console.log('Database seeded successfully.');
});

db.close();
