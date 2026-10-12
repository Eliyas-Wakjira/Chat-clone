import express from 'express';
import { signup, login } from './auth.controller.js';

const authRouter = express.Router();

authRouter.post('/register', signup);
authRouter.post('/login', login);

export default authRouter;