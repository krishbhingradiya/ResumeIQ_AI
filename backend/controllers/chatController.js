/**
 * Chat Controller
 * Handles AI career advisor conversations
 * Uses resume analysis as context for personalized advice
 */

const chatService = require('../services/chatService');

/**
 * POST /chat
 * Send a message to the AI career advisor
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message, analysisContext, chatHistory } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    console.log(`💬 Chat: "${message.substring(0, 60)}..."`);

    const reply = await chatService.getCareerAdvice(
      message.trim(),
      analysisContext || null,
      chatHistory || []
    );

    console.log('✅ Chat reply generated');

    res.json({
      success: true,
      reply,
    });

  } catch (error) {
    console.error('❌ Chat failed:', error.message);
    next(error);
  }
};

module.exports = { sendMessage };
