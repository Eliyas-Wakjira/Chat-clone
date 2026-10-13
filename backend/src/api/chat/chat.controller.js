import Groq from 'groq-sdk';
import db from '../../../db/db.config.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const askChat = async (req, res) => {
  const { prompt, userId } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt is required' });
  }

  try {
    // 1. Groq API Call
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-120b',
    });

    const aiMessage = completion.choices[0]?.message?.content || 'No response';

    // 2. Save User Prompt to Database
    await db.query(
      'INSERT INTO conversations (user_id, role, content) VALUES (?, ?, ?)',
      [userId || null, 'user', prompt]
    );

    // 3. Save AI Response to Database
    await db.query(
      'INSERT INTO conversations (user_id, role, content) VALUES (?, ?, ?)',
      [userId || null, 'assistant', aiMessage]
    );

    return res.status(200).json({
      success: true,
      message: aiMessage,
    });

  } catch (error) {
    // Terminal backend irratti rakkoo isaa sirriitti print gochuu
    console.error('--- DETAILED BACKEND ERROR ---');
    console.error(error);
    console.error('------------------------------');

    return res.status(500).json({
      success: false,
      error: error.message || 'Error processing request',
    });
  }
};

export const getConversations = async (req, res) => {
  const { userId } = req.query;
  try {
    const [rows] = userId
      ? await db.query(
          'SELECT id, role, content FROM conversations WHERE user_id = ? ORDER BY id ASC',
          [userId]
        )
      : await db.query(
          'SELECT id, role, content FROM conversations ORDER BY id ASC'
        );

    return res.status(200).json({
      success: true,
      messages: rows,
    });
  } catch (error) {
    console.error('Fetch Conversations DB Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};