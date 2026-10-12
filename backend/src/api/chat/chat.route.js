import express from 'express';
import { askChat, getConversations } from './chat.controller.js';

const router = express.Router();

router.post('/ask', askChat);
router.get('/history', getConversations);

export default router;