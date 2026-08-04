const express = require("express");
const router = express.Router();
const { handleChatQuery, handleVoiceQuery } = require("../controllers/chatController");

router.post("/query", handleChatQuery);
router.post("/voice", handleVoiceQuery);

module.exports = router;
