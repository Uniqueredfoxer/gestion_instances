import express from 'express';
import { register, loginUser } from '../controllers/authController.js';

const authRoutes = express.Router();


authRoutes.post('/register', register);
authRoutes.post('/login', loginUser);
export default authRoutes;