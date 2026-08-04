const express = require("express");
const router = express.Router();
const { analyzeSoil } = require("../controllers/soilController");

router.post("/analyze", analyzeSoil);

module.exports = router;
