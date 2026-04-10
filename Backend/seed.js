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
    image_url TEXT
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
  const insertMenu = db.prepare(`INSERT INTO menu_items (name, category, price, status, image_url) VALUES (?, ?, ?, ?, ?)`);
  
  const menuList = [
    { name: 'Grilled Chicken Salad', category: 'Lunch', price: 680, status: 'available', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60' },
    { name: 'Classic Cheeseburger', category: 'Lunch', price: 480, status: 'available', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60' },
    { name: 'Margherita Pizza', category: 'Dinner', price: 720, status: 'available', image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60' },
    { name: 'Avocado Toast', category: 'Breakfast', price: 440, status: 'available', image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=500&auto=format&fit=crop&q=60' },
    { name: 'Pancakes with Syrup', category: 'Breakfast', price: 360, status: 'available', image_url: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=500&auto=format&fit=crop&q=60' },
    { name: 'Latte Coffee', category: 'Beverage', price: 280, status: 'available', image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&auto=format&fit=crop&q=60' },
    { name: 'Vegan Buddha Bowl', category: 'Lunch', price: 760, status: 'available', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60' },
    { name: 'Spaghetti Carbonara', category: 'Dinner', price: 640, status: 'available', image_url: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&auto=format&fit=crop&q=60' }
  ];

  menuList.forEach(m => insertMenu.run(m.name, m.category, m.price, m.status, m.image_url));
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
