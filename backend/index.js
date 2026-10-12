import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mainRouter from './src/api/main.route.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Root test route backend sirriitti hojjechuu isaa mirkaneessuuf
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ChatGPT Clone Backend API is running smoothly!',
    timestamp: new Date()
  });
});

// /api + /chat + /ask => /api/chat/ask
// /api + /chat + /conversations => /api/chat/conversations
app.use('/api', mainRouter);

const PORT = process.env.PORT || 3888;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ChatGPT Clone Backend API is running smoothly!',
    timestamp: new Date()
  });
});