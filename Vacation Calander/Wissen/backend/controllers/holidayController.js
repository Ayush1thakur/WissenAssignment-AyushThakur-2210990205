const axios = require("axios");

const API_KEY = "WuPrWr8TfcAJIyahhV09VA==Sgre5eWB14DVaDvX";

const getPublicHolidays = async (req, res) => {
  const { country } = req.params; // ISO country code e.g. IN, US, GB, CA

  try {
    const response = await axios.get("https://api.api-ninjas.com/v1/publicholidays", {
      headers: { "X-Api-Key": API_KEY },
      params: { country } // year omitted for free tier
    });

    const holidays = (response.data || []).map(h => ({
      name: h.name,
      local_name: h.local_name,
      date: h.date,
      country: h.country,
      federal: h.federal
    }));

    res.json({ holidays });
  } catch (err) {
    console.error("Error fetching public holidays:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch public holidays" });
  }
};

module.exports = { getPublicHolidays };
