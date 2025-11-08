// export function showUploadForm(req, res) {
//   res.render('upload', { title: 'Upload Lost Item' });
// }

// export function handleUpload(req, res) {
//   const { description } = req.body;
//   const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

//   console.log('Uploaded file:', req.file);
//   console.log('Description:', description);

//   res.render('uploadSuccess', { title: 'Upload Complete', description, photoPath });
// }


// src/controllers/uploadController.js
import { supabase } from '../models/supabaseClient.js';
import fs from 'fs';
import path from 'path';

export function showUploadForm(req, res) {
  res.render('upload', { title: 'Upload Lost Item' });
}

export async function handleUpload(req, res) {
  try {
    const { description, building } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    // Generate unique file name
    // 🧼 Sanitize file name (remove spaces and unsafe characters) AI Generated
    const baseName = path.parse(file.originalname).name;
    const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_'); // letters, numbers, underscores, dashes only
    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}_${safeName}${fileExt}`;


    // Upload file to Supabase Storage (bucket: "lost-items")
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lost-items')
      .upload(`photos/${fileName}`, fs.createReadStream(file.path), {
        cacheControl: '3600',
        upsert: false,
        contentType: file.mimetype,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).send('Failed to upload image to Supabase.');
    }

    // Get public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('lost-items')
      .getPublicUrl(`photos/${fileName}`);

    const photoUrl = publicUrlData.publicUrl;

    const { item_name } = req.body; // <-- get the user input

    const { data: insertData, error: insertError } = await supabase
      .from('Items')
      .insert([
        {
          item_name, // use the name entered in the form
          item_description: description,
          building_found: building,
          photo_url: photoUrl,
        },
      ])
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).send('Failed to save item to Supabase.');
    }

    console.log('Inserted item:', insertData);

    // Render success page
    res.render('uploadSuccess', {
      title: 'Upload Complete',
      description,
      photoPath: photoUrl,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).send('Server error while uploading item.');
  }
}
