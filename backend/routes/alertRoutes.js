import express from 'express';
import * as alertController from '../controllers/alertController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', alertController.getAllAlerts);

router.get('/unread/count', alertController.getUnreadAlertCount);

router.get('/:id', alertController.getAlertById);

router.get('/dossier/:dossierId', alertController.getAlertsByDossier);

router.get('/user/:userId', alertController.getAlertsByUser);

router.post('/', alertController.createAlert);

router.put('/:id/read', alertController.markAlertAsRead);

router.put('/read-all', alertController.markAllAlertsAsRead);

router.delete('/:id', alertController.deleteAlert);

router.delete(
  '/dossier/:dossierId', alertController.deleteAlertsByDossier);

router.post('/reminders', alertController.createDueDateReminders);

export default router;