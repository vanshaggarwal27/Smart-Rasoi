const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'cafeteria.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database.');
});

// --- API Endpoints ---

// Dashboard Overview
app.get('/api/dashboard/overview', (req, res) => {
  console.log('Fetching dashboard overview...');
  const todayDate = new Date().toISOString().split('T')[0];

  const queries = {
    totalMealsToday: `SELECT SUM(quantity) as count FROM transactions WHERE date(timestamp) = ? OR date(timestamp) = date('now')`,
    totalTransactions: `SELECT COUNT(*) as count FROM transactions`,
    wasteToday: `SELECT SUM(quantity_wasted) as count FROM food_waste WHERE date = ? OR date = date('now')`,
    popularItems: `
      SELECT m.name, m.image_url, m.price, SUM(t.quantity) as sold 
      FROM transactions t 
      JOIN menu_items m ON t.item_id = m.id 
      GROUP BY t.item_id ORDER BY sold DESC LIMIT 5
    `,
    dailyConsumption: `
      SELECT date(timestamp) as date, SUM(quantity) as meals 
      FROM transactions 
      GROUP BY date(timestamp) ORDER BY date ASC LIMIT 7
    `,
    wasteByCategory: `
      SELECT m.category, SUM(f.quantity_wasted) as waste 
      FROM food_waste f
      JOIN menu_items m ON f.item_id = m.id
      GROUP BY m.category
    `
  };

  let results = {
    totalMealsToday: 0,
    totalTransactions: 0,
    wasteToday: 0,
    popularItems: [],
    dailyConsumption: [],
    wasteByCategory: []
  };

  console.log('Running totalMealsToday...');
  db.get(queries.totalMealsToday, [todayDate], (err, row) => {
    if (err) console.error('Error totalMealsToday:', err);
    if (row && row.count) results.totalMealsToday = row.count;
    
    console.log('Running totalTransactions...');
    db.get(queries.totalTransactions, [], (err, row) => {
      if (err) console.error('Error totalTransactions:', err);
      if (row && row.count) results.totalTransactions = row.count;
      
      console.log('Running wasteToday...');
      db.get(queries.wasteToday, [todayDate], (err, row) => {
        if (err) console.error('Error wasteToday:', err);
        if (row && row.count) results.wasteToday = row.count;
        
        console.log('Running popularItems...');
        db.all(queries.popularItems, [], (err, rows) => {
          if (err) console.error('Error popularItems:', err);
          if (rows) results.popularItems = rows;
          
          console.log('Running dailyConsumption...');
          db.all(queries.dailyConsumption, [], (err, rows) => {
            if (err) console.error('Error dailyConsumption:', err);
            if (rows) results.dailyConsumption = rows;
            
            console.log('Running wasteByCategory...');
            db.all(queries.wasteByCategory, [], (err, rows) => {
              if (err) console.error('Error wasteByCategory:', err);
              if (rows) results.wasteByCategory = rows;
              
              console.log('Overview fetch complete.');
              res.json(results);
            });
          });
        });
      });
    });
  });
});

// Menu Management
app.get('/api/menu', (req, res) => {
  db.all(`SELECT * FROM menu_items`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/menu', (req, res) => {
  const { name, category, price, status, image_url, calories, protein, carbs, fats } = req.body;
  db.run(`INSERT INTO menu_items (name, category, price, status, image_url, calories, protein, carbs, fats) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [name, category, price, status, image_url, calories || 0, protein || 0, carbs || 0, fats || 0], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, category, price, status, image_url, calories, protein, carbs, fats });
  });
});

app.put('/api/menu/:id', (req, res) => {
  const { name, category, price, status, image_url, calories, protein, carbs, fats } = req.body;
  db.run(`UPDATE menu_items SET name=?, category=?, price=?, status=?, image_url=?, calories=?, protein=?, carbs=?, fats=? WHERE id=?`, 
    [name, category, price, status, image_url, calories || 0, protein || 0, carbs || 0, fats || 0, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
  });
});

app.delete('/api/menu/:id', (req, res) => {
  db.run(`DELETE FROM menu_items WHERE id=?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Consumption Tracking (Transactions)
app.get('/api/transactions', (req, res) => {
  db.all(`
    SELECT t.id, t.student_id, m.name as food_item, t.quantity, t.total_price, t.meal_category, t.timestamp
    FROM transactions t
    JOIN menu_items m ON t.item_id = m.id
    ORDER BY t.timestamp DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/consumption/analytics', (req, res) => {
  db.all(`
    SELECT meal_category as name, SUM(quantity) as value
    FROM transactions
    GROUP BY meal_category
  `, (err, pieData) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all(`
      SELECT m.name, SUM(t.quantity) as sold
      FROM transactions t
      JOIN menu_items m ON t.item_id = m.id
      GROUP BY t.item_id ORDER BY sold DESC LIMIT 10
    `, (err, barData) => {
      res.json({ pieData, barData });
    });
  });
});

// Food Waste Tracking
app.get('/api/waste', (req, res) => {
  db.all(`
    SELECT w.id, m.name as food_item, w.quantity_prepared, w.quantity_sold, w.quantity_wasted, w.reason, w.date
    FROM food_waste w
    JOIN menu_items m ON w.item_id = m.id
    ORDER BY w.date DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/waste', (req, res) => {
  const { item_id, quantity_prepared, quantity_sold, quantity_wasted, reason, date } = req.body;
  db.run(`INSERT INTO food_waste (item_id, quantity_prepared, quantity_sold, quantity_wasted, reason, date) VALUES (?, ?, ?, ?, ?, ?)`, 
    [item_id, quantity_prepared, quantity_sold, quantity_wasted, reason, date], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, success: true });
  });
});

// Staff Management
app.get('/api/staff', (req, res) => {
  db.all(`SELECT id, name, email, role FROM users`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
