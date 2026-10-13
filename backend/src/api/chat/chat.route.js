import express from 'express';
import {
  askChat,
  getConversations,
  getRecentConversations,
} from './chat.controller.js';

const router = express.Router();

router.post('/ask', askChat);
router.get('/conversations', getRecentConversations);
router.get('/history', getConversations);

export default router;