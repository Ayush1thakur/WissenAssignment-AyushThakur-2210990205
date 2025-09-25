const express = require("express");
const router = express.Router();
const { getHolidays } = require("../controllers/holidayController");

router.get("/:country/:year", getHolidays);

module.exports = router;
