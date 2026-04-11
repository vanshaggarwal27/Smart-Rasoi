const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'd:/projects/Nmims_hackathon/Backend/.env' });

const db = new sqlite3.Database('d:/projects/Nmims_hackathon/Backend/cafeteria.db');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const imageMap = {
  'Aloo Paratha': 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&auto=format&fit=crop&q=60',
  'Idli Sambar': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60',
  'Poha': 'https://images.unsplash.com/photo-1606131731446-5568d87113aa?w=500&auto=format&fit=crop&q=60',
  'Upma': 'https://images.unsplash.com/photo-1645054366627-6f81c95b4515?w=500&auto=format&fit=crop&q=60',
  'Medu Vada': 'https://images.unsplash.com/photo-1630409351241-e90e765e721d?w=500&auto=format&fit=crop&q=60',
  'Paneer Butter Masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60',
  'Veg Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=500&auto=format&fit=crop&q=60',
  'Chole Bhature': 'https://images.unsplash.com/photo-1589301773859-bc690bc706ec?w=500&auto=format&fit=crop&q=60',
  'Rajma Chawal': 'https://images.unsplash.com/photo-1545240062-af19da75f90a?w=500&auto=format&fit=crop&q=60',
  'Veg Pulao': 'https://images.unsplash.com/photo-1516714435131-44eb18ce27c4?w=500&auto=format&fit=crop&q=60',
  'Dal Tadka + Roti': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60',
  'Palak Paneer': 'https://images.unsplash.com/photo-1601050690597-df056fb460a5?w=500&auto=format&fit=crop&q=60',
  'Chicken Biryani': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=60',
  'Mutton Curry + Rice': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60',
  'Samosa': 'https://images.unsplash.com/photo-1601050690597-df056fb460a5?w=500&auto=format&fit=crop&q=60',
  'Pav Bhaji': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60',
  'Vada Pav': 'https://images.unsplash.com/photo-1601050690597-df056fb460a5?w=500&auto=format&fit=crop&q=60',
  'Dhokla': 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=60',
  'Bhel Puri': 'https://images.unsplash.com/photo-1516714435131-44eb18ce27c4?w=500&auto=format&fit=crop&q=60',
  'Bread Pakora': 'https://images.unsplash.com/photo-1601050690597-df056fb460a5?w=500&auto=format&fit=crop&q=60',
  'Paneer Tikka Masala': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60',
  'Egg Curry + Rice': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60',
  'Aloo Gobi Sabzi': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
  'Mix Veg Thali': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
  'Masala Chai': 'https://images.unsplash.com/photo-1594631252845-29fc458639a7?w=500&auto=format&fit=crop&q=60',
  'Filter Coffee': 'https://images.unsplash.com/photo-1541167760496-162955ed8ad2?w=500&auto=format&fit=crop&q=60',
  'Lassi (Sweet)': 'https://images.unsplash.com/photo-1594631252845-29fc458639a7?w=500&auto=format&fit=crop&q=60',
  'Buttermilk (Chaas)': 'https://images.unsplash.com/photo-1594631252845-29fc458639a7?w=500&auto=format&fit=crop&q=60',
  'Fresh Lime Soda': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60',
  'Sugarcane Juice': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60',
  'Masala Dosa': 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&auto=format&fit=crop&q=60'
};

async function updateImages() {
  for (const [name, url] of Object.entries(imageMap)) {
    console.log(`Updating ${name}...`);
    
    // Update Supabase
    const { error: sbError } = await supabase
      .from('food_items')
      .update({ image_url: url })
      .eq('name', name);
    
    if (sbError) console.error(`Supabase error for ${name}:`, sbError.message);
    else console.log(`  Supabase updated for ${name}`);

    // Update SQLite
    db.run('UPDATE menu_items SET image_url = ? WHERE name = ?', [url, name], (err) => {
      if (err) console.error(`SQLite error for ${name}:`, err.message);
      else console.log(`  SQLite updated for ${name}`);
    });
  }
}

updateImages().then(() => {
  setTimeout(() => {
    db.close();
    console.log('Update finished.');
  }, 5000);
});
