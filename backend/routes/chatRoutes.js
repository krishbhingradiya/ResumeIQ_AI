/**
 * Chat Routes
 * Handles AI career advisor chat endpoint
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /chat — Send a message to AI career advisor
router.post('/chat', chatController.sendMessage);

module.exports = router;
