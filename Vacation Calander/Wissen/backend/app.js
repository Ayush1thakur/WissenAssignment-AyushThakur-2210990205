const express = require("express");
const cors = require("cors");
const holidayRoutes = require("./routes/holidays");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/holidays", holidayRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
