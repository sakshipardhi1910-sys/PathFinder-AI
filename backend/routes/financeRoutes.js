const express = require("express");
const { analyzeFinance } = require("../controllers/financeController");

const router = express.Router();

router.post("/", analyzeFinance);
router.post("/analyze", analyzeFinance);

module.exports = router;
