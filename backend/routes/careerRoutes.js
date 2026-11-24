const express = require("express");
const { analyzeCareer } = require("../controllers/careerController");

const router = express.Router();

router.post("/", analyzeCareer);
router.post("/analyze", analyzeCareer);

module.exports = router;
