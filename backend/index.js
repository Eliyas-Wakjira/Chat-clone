import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mainRouter from './src/api/main.route.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// /api + /chat + /ask => /api/chat/ask
// /api + /chat + /conversations => /api/chat/conversations
app.use('/api', mainRouter);

const PORT = process.env.PORT || 3888;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));