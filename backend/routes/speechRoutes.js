const express = require("express");
const { checkSpeech } = require("../controllers/speechController");

const router = express.Router();

router.post("/", checkSpeech);

module.exports = router;

