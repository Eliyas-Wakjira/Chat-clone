import Groq from 'groq-sdk';
import db from '../../../db/db.config.js';

export const askChat = async (req, res) => {
  const { prompt, userId, conversationId, history = [] } = req.body;

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ success: false, error: 'Prompt is required' });
  }

  if (conversationId != null && typeof conversationId !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid conversation ID' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({
      success: false,
      error: 'GROQ_API_KEY is missing. Add your Groq API key to backend/.env.',
    });
  }

  const previousMessages = Array.isArray(history)
    ? history
      .filter(
        (message) =>
          ['user', 'assistant'].includes(message?.role) &&
          typeof message.content === 'string'
      )
      .slice(-20)
      .map(({ role, content }) => ({ role, content }))
    : [];

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [
        ...previousMessages,
        { role: 'user', content: prompt.trim() },
      ],
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    });

    const aiMessage = completion.choices[0]?.message?.content;
    if (typeof aiMessage !== 'string' || !aiMessage.trim()) {
      throw new Error('The AI provider returned an empty response.');
    }

    await db.query(
      'INSERT INTO conversations (user_id, conversation_id, role, content) VALUES (?, ?, ?, ?)',
      [userId || null, conversationId || null, 'user', prompt.trim()]
    );
    await db.query(
      'INSERT INTO conversations (user_id, conversation_id, role, content) VALUES (?, ?, ?, ?)',
      [userId || null, conversationId || null, 'assistant', aiMessage]
    );

    return res.status(200).json({ success: true, message: aiMessage });
  } catch (error) {
    console.error('Chat request failed:', error.message);
    return res.status(502).json({
      success: false,
      error: error.message || 'Error processing request',
    });
  }
};

export const getConversations = async (req, res) => {
  const { userId, conversationId } = req.query;

  try {
    const legacyMatch = /^legacy-(\d+)$/.exec(conversationId || '');
    if (legacyMatch) {
      const ownerCondition = userId ? 'user_id = ?' : 'user_id IS NULL';
      const ownerParams = userId ? [userId] : [];
      const [rows] = await db.query(
        `SELECT id, role, content
         FROM conversations
         WHERE ${ownerCondition}
           AND id >= ?
           AND conversation_id IS NULL
         ORDER BY id ASC
         LIMIT 20`,
        [...ownerParams, Number(legacyMatch[1])]
      );

      const messages = [];
      for (const row of rows) {
        if (messages.length > 0 && row.role === 'user') break;
        if (messages.length === 0 && Number(row.id) !== Number(legacyMatch[1])) continue;
        messages.push({ id: row.id, role: row.role, content: row.content });
      }
      return res.status(200).json({ success: true, messages });
    }

    const conditions = [];
    const params = [];

    if (conversationId) {
      conditions.push('conversation_id = ?');
      params.push(conversationId);
    }

    if (userId) {
      conditions.push('user_id = ?');
      params.push(userId);
    } else {
      conditions.push('user_id IS NULL');
    }

    const [rows] = await db.query(
      `SELECT id, role, content FROM conversations WHERE ${conditions.join(' AND ')} ORDER BY id ASC`,
      params
    );

    return res.status(200).json({ success: true, messages: rows });
  } catch (error) {
    console.error('Fetch conversations failed:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Could not fetch conversation history',
    });
  }
};

export const getRecentConversations = async (req, res) => {
  const { userId } = req.query;
  const ownerCondition = userId ? 'user_id = ?' : 'user_id IS NULL';
  const ownerParams = userId ? [userId] : [];

  try {
    const [threadRows] = await db.query(
      `SELECT c.conversation_id AS conversationId,
        (SELECT content
         FROM conversations first_message
         WHERE first_message.conversation_id = c.conversation_id
           AND first_message.${ownerCondition}
           AND first_message.role = 'user'
         ORDER BY first_message.id ASC
         LIMIT 1) AS title,
        MAX(c.id) AS lastId
       FROM conversations c
       WHERE c.${ownerCondition}
         AND c.conversation_id IS NOT NULL
       GROUP BY c.user_id, c.conversation_id
       ORDER BY MAX(c.id) DESC
       LIMIT 10`,
      [...ownerParams, ...ownerParams]
    );
    const [legacyRows] = await db.query(
      `SELECT id, content AS title
       FROM conversations
       WHERE ${ownerCondition}
         AND role = 'user'
         AND conversation_id IS NULL
       ORDER BY id DESC
       LIMIT 10`,
      ownerParams
    );
    const conversations = [
      ...threadRows.map((row) => ({ ...row, lastId: Number(row.lastId) })),
      ...legacyRows.map((row) => ({
        conversationId: `legacy-${row.id}`,
        title: row.title,
        lastId: Number(row.id),
      })),
    ]
      .sort((left, right) => right.lastId - left.lastId)
      .slice(0, 10)
      .map(({ lastId, ...row }) => row);

    return res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error('Fetch recent conversations failed:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Could not fetch recent conversations',
    });
  }
};
