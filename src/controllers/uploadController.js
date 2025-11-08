function showUploadForm(req, res) {
  res.render('upload', { title: 'Upload Lost Item' });
}

function handleUpload(req, res) {
  const { description } = req.body;
  const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

  console.log('Uploaded file:', req.file);
  console.log('Description:', description);

  res.render('uploadSuccess', { title: 'Upload Complete', description, photoPath });
}

module.exports = {
  showUploadForm,
  handleUpload
};
