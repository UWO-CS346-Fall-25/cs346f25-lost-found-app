const { supabase } = require('../models/supabaseClient');

exports.showAllUploads = async (req, res, returnDataOnly = false) => {
  try {
    console.log("Fetching all items from Supabase... Timestamp: ", Date.now());
    const { data: items, error } = await supabase
      .from('Items')
      .select('id, item_name, item_description, building_found, photo_url')
      .order('id', { ascending: false });

    if (error) {
      console.error("Supabase fetch error, allItemsController:", error, " Timestamp: ", Date.now());
      if (returnDataOnly) return { lostItems: [], error };
      return res.status(500).send("Failed to fetch items.");
    }

    const lostItems = items.map((item) => ({
      id: item.id,
      name: item.item_name,
      description: item.item_description,
      location: item.building_found,
      image: item.photo_url
    }));


    if (returnDataOnly) {
      return { lostItems };
    }
    res.render("allResults", {
      title: "All Results",
      lostItems
    });

  } catch (err) {
    console.error("Unexpected error in allItemsController: ", err, " Timestamp:", Date.now());
    if (returnDataOnly) return { lostItems: [], error: err };
    return res.status(500).send("Server error.");
  }
};
