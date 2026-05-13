import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChat, HiX, HiPaperAirplane, HiSparkles, HiLightBulb } from 'react-icons/hi';
import { sendChatMessage } from '../services/api';

const suggestedQuestions = [
  '🎯 What career path suits my resume?',
  '📊 How can I improve for Data Science roles?',
  '💻 What should I add for Backend Development?',
  '🤖 How to transition into AI/ML?',
  '📱 What skills do I need for App Development?',
  '✏️ What should I remove from my resume?',
];

const CareerChat = memo(({ analysisContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey there! 👋 I'm your **ResumeIQ Career Advisor**.\n\nI've already analyzed your resume (ATS Score: **${analysisContext?.atsScore || '—'}/100**). Ask me anything about:\n\n• 🎯 Career path suggestions\n• 📝 What to add or remove from your resume\n• 💡 Skills to learn for specific roles\n• 🚀 How to improve your ATS score\n\nWhat field are you interested in?`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = useCallback(async (messageText = null) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const chatHistory = messages
        .filter((_, i) => i > 0)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await sendChatMessage(text, analysisContext, chatHistory);

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.reply },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message}. Please try again! 🔄`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages, analysisContext]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.1) inset',
            }}
            id="career-chat-toggle"
          >
            <HiChat className="text-white text-xl" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold text-dark-950 animate-pulse">
              AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl"
            style={{
              width: 'min(420px, calc(100vw - 48px))',
              height: 'min(600px, calc(100vh - 120px))',
              background: 'rgba(10, 10, 25, 0.98)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 60px rgba(99, 102, 241, 0.08)',
              backdropFilter: 'blur(24px)',
            }}
            id="career-chat-window"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
                borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  <HiSparkles className="text-white text-sm" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Career Advisor AI</h3>
                  <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-dark-400 transition-all hover:bg-white/[0.06] hover:text-white"
                id="close-chat"
              >
                <HiX className="text-base" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" id="chat-messages">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                      msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                    }`}
                    style={
                      msg.role === 'user'
                        ? {
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                          }
                        : {
                            background: 'rgba(255, 255, 255, 0.04)',
                            color: '#e2e8f0',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                          }
                    }
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div
                    className="flex items-center gap-2.5 rounded-2xl rounded-bl-md px-5 py-3.5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div className="flex gap-1">
                      {[0, 150, 300].map((delay) => (
                        <motion.span
                          key={delay}
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: delay / 1000 }}
                          className="h-1.5 w-1.5 rounded-full bg-primary-400/60"
                        />
                      ))}
                    </div>
                    <span className="text-dark-500 text-[11px]">Thinking...</span>
                  </div>
                </motion.div>
              )}

              {/* Suggested questions */}
              {showSuggestions && messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2 pt-2"
                >
                  <p className="flex items-center gap-1 px-1 text-[11px] text-dark-500">
                    <HiLightBulb className="text-amber-400" /> Try asking:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(q)}
                        className="rounded-xl px-3 py-2 text-[11px] text-dark-300 transition-all hover:scale-[1.02] hover:text-white"
                        style={{
                          background: 'rgba(99, 102, 241, 0.08)',
                          border: '1px solid rgba(99, 102, 241, 0.15)',
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              className="flex-shrink-0 px-4 py-3"
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                background: 'rgba(0, 0, 0, 0.2)',
              }}
            >
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your career..."
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder-dark-600"
                  disabled={isLoading}
                  id="chat-input"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-all disabled:opacity-20"
                  style={{
                    background: inputValue.trim()
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'transparent',
                  }}
                  id="chat-send"
                >
                  <HiPaperAirplane className="text-white text-sm rotate-90" />
                </button>
              </div>
              <p className="mt-2 text-center text-[9px] text-dark-600 tracking-wider">
                Powered by ResumeIQ AI • Your data stays private
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

CareerChat.displayName = 'CareerChat';

export default CareerChat;
