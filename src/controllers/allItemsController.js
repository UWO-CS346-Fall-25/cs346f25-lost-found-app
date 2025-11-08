const uploadedItems = [];

export function showAllUploads(req, res) {
  res.render('allUploads', {
    title: 'All Uploaded Items',
    items: uploadedItems, 
  });
}