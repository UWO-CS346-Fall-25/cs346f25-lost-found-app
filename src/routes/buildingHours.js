const express = require("express");
const router = express.Router();

const { getBuildingHours } = require("../controllers/buildingHoursController.js");

router.get("/:building", async (req, res) => {
  const building = req.params.building;
  const result = await getBuildingHours(building);
  res.json(result);
});

module.exports = router;
