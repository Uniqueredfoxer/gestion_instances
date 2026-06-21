import express from "express";
import { AlertController } from "../controllers/alertController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);
router.get("/", AlertController.getAllAlerts);
router.get("/mes-alertes", AlertController.getUserAlerts);
router.get("/:id", AlertController.getAlertById);
router.get("/dossier/:dossierId", AlertController.getAlertsByDossier);
router.post("/", AlertController.createAlert);
router.delete("/:id", AlertController.deleteAlert);
router.delete("/dossier/:dossierId", AlertController.deleteAlertsByDossier);
router.post("/reminders", AlertController.createDueDateReminders);

export default router;
