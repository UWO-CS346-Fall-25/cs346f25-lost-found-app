import { supabaseAdmin } from '../models/supabaseAdmin.js';

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
    const baseName = path.parse(file.originalname).name;
    const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}_${safeName}${fileExt}`;


    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
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

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('lost-items')
      .getPublicUrl(`photos/${fileName}`);

    const photoUrl = publicUrlData.publicUrl;

    const { item_name } = req.body;

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('Items')
      .insert([
        {
          item_name,
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
