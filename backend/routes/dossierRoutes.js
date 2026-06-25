import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { DossierController } from '../controllers/dossierController.js';
import { TacheController } from '../controllers/tacheController.js';

const router = express.Router();


router.use(authenticateToken);


router.post('/create', DossierController.createDossier);
router.get('/', DossierController.getAllDossiers);
router.get('/stats', DossierController.getStatistics);
router.get('/mes-taches', TacheController.getMyTasks);
router.get('/stats/:id', TacheController.getMyStats)
router.get('/:id', DossierController.getDossierById);
router.put('/update/:id', DossierController.updateDossier);
router.delete('/delete/:id', DossierController.deleteDossier);


router.post('/:dossierId/taches/create', DossierController.createTask);
router.get('/:dossierId/taches', DossierController.getTasks);
router.put('/taches/update/:taskId', DossierController.updateTask);
router.delete('/taches/delete/:taskId', DossierController.deleteTask)
router.post('/taches/validate/:taskId', DossierController.validateTaskCompletion);


router.put('/taches/avancement/:taskId/', TacheController.updateProgress);
router.post('/taches/demander-validation/:taskId', TacheController.requestCompletion);

export default router;