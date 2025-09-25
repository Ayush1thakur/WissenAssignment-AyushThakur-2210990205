const express = require("express");
const { getPublicHolidays } = require("../controllers/holidayController");

const router = express.Router();

// GET /api/holidays/:country
router.get("/:country", getPublicHolidays);

module.exports = router;
