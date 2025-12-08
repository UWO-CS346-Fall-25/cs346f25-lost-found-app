// src/controllers/uploadController.js
const { supabaseAdmin } = require('../models/supabaseAdmin');
const fs = require('fs');
const path = require('path');

// Show the upload form
exports.showUploadForm = (req, res) => {
  res.render('upload', { title: 'Upload Lost Item' });
};

// Handle file upload
exports.handleUpload = async (req, res) => {
  const { item_name, description, building } = req.body;
  const file = req.file;

  if (!file) return res.status(400).send("No file uploaded");

  // Create a unique filename
  const filePath = `${Date.now()}_${file.originalname}`;

  try {
    // Upload to Supabase Storage using admin client
    const { data, error } = await supabaseAdmin.storage
      .from('lost-items')  // bucket name
      .upload(`photos/${filePath}`, fs.createReadStream(file.path), {
        contentType: file.mimetype,
      });

    if (error) throw error;

    // Construct public URL (bucket is public)
    const photo_url = `${process.env.SUPABASE_URL}/storage/v1/object/public/lost-items/photos/${filePath}`;

    // Insert row into Items table
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('Items')
      .insert({
        item_name,
        item_description: description,
        building_found: building,
        status: 0, // available
        photo_url,
      });

    if (dbError) throw dbError;

    // Delete the temporary file from local uploads folder
    fs.unlinkSync(file.path);

    // Redirect to homepage
    res.redirect('/');
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Failed to upload file");
  }
};
