import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { UserController } from '../controllers/userController.js';

const router = express.Router();


router.use(authenticateToken);


router.delete('/delete/:id', UserController.deleteUser);
router.get('/', UserController.getAllUsers);
router.post('/create', UserController.createUser);
router.get('/performances', UserController.getWorkerPerformance);
router.get('/:id', UserController.getUserById);
router.put('/update/:id', UserController.updateUser);

export default router;