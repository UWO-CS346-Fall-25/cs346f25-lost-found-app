// src/controllers/allItemsController.js
const { supabase } = require('../models/supabaseClient');

exports.showAllUploads = async (req, res) => {
  try {
    // Fetch all items from Supabase
    const { data: items, error } = await supabase
      .from('Items')
      .select('id, item_name, item_description, building_found, photo_url')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error);
      return res.status(500).send('Failed to load lost items.');
    }

    // Map to match your EJS variable names
    const lostItems = items.map((item) => ({
      id: item.id,
      name: item.item_name,
      description: item.item_description,
      location: item.building_found,
      image: item.photo_url,
    }));

    // Render the correct view and pass the correct variable name
    res.render('allResults', {
      title: 'All Lost Items',
      lostItems, // 👈 matches your EJS variable
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).send('Server error while loading items.');
  }
};
