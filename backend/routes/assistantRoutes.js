const express = require("express");
const { getAssistantGuidance } = require("../controllers/assistantController");
const router = express.Router();
router.post("/", getAssistantGuidance);
module.exports = router;
