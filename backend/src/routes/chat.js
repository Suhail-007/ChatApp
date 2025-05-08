import express from 'express';
import { GoogleGenAI } from '@google/genai';

import Message from '../models/Message.js';
import User from '../models/User.js';

import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Initialize Gemini API
console.log('🚀 ~ process.env.GEMINI_API_KEY):', process.env.GEMINI_API_KEY);
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Middleware to get user from token (simple version, for demo)
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  try {
    const token = authHeader.split(' ')[1];
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all messages for the logged-in user
router.get('/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ user: req.userId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a message and get Gemini response
router.post('/message', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Message text is required' });

    const messagesHistory = await Message.find({ user: req.userId })
      .sort({ createdAt: 1 })
      .then(messages => {
        return messages
          .map(msg => {
            if (msg.sender === 'ai') {
              return {
                role: 'model',
                parts: [{ text: msg.text }],
              };
            }
            // User message
            if (msg.sender === 'user') {
              return {
                role: msg.sender,
                parts: [{ text: msg.text }],
              };
            }
          })
          .filter(msg => msg !== undefined);
      })

      .catch(err => {
        console.error('Error fetching messages:', err);
        return [];
      });

    console.log('messagesHistory:', messagesHistory);

    // Save user message
    const userMsg = await Message.create({
      user: req.userId,
      text,
      sender: 'user',
    });
    // Get or create chat history for this user
    // if (!chatHistory.has(req.userId)) {
    //   chatHistory.set(
    //     req.userId,
    //     model.startChat({
    //       history: messagesHistory,
    //       generationConfig: {
    //         maxOutputTokens: 1000,
    //         temperature: 0.7,
    //       },
    //     })
    //   );
    // }

    const aiResponse = await model.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: text,
      history: messagesHistory,
      config: {
        systemInstruction: [
          "You need to document and reflect on the user's day",
          'When users ask you to Summarize their day.',
          'Give motivation and encouragement when asked',
          'Provide feedback to improve their week',
          'Add daily tags using sentimental analysis.',
          'You are a personal assistant that helps users reflect on their day.',
          "You need to save the user's messages and give minor feedback.",
        ],
        maxOutputTokens: 1000,
      },
    });

    // const chat = chatHistory.get(req.userId);

    // Generate response from Gemini
    // const result = await chat.sendMessage(text);
    // const response = await result.response;
    // const aiText = response.text();

    // Save AI response
    const aiMsg = await Message.create({
      user: req.userId,
      text: aiResponse.text,
      sender: 'ai',
    });

    await userMsg.save();
    await aiMsg.save();

    res.json([userMsg, aiMsg]);
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: err.message || 'Error processing message' });
  }
});

export default router;
