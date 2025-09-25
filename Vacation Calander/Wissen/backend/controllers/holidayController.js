const axios = require("axios");

const API_KEY = "IMmr5Ce3kKYzaKBCC7aiq3OcTjMImiwo";

const getHolidays = async (req, res) => {
  const { country, year } = req.params;

  try {
    const response = await axios.get("https://calendarific.com/api/v2/holidays", {
      params: { api_key: API_KEY, country, year }
    });

    const holidays = (response.data.response.holidays || [])
      .filter(h => h.date && h.date.iso)
      .map(h => ({
        name: h.name,
        date: h.date.iso,
        type: h.primary_type // keep type for coloring
      }));

    res.json({ holidays });

  } catch (err) {
    console.error("Error fetching holidays:", err.response ? err.response.data : err.message);
    res.status(500).json({ error: err.response?.data?.meta?.error_detail || "Failed to fetch holidays" });
  }
};

module.exports = { getHolidays };
