import { DossierService } from '../services/dossierService.js';
import { TacheService } from '../services/tacheService.js';

export const DossierController = {

    async createDossier(req, res) {
        try {
            if (!['admin', 'directeur'].includes(req.user.role)) {
                return res.status(403).json({ error: "Seuls les directeurs et administrateurs peuvent créer des dossiers" });
            }
            
            const dossier = await DossierService.createDossier(
                req.body,
                req.user.id,
                req.user.role
            );
            
            res.status(201).json({ success: true, data:dossier });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    
  
    async getAllDossiers(req, res) {
        try {
            const { statut, date_debut, date_fin, recherche, limite, decalage } = req.query;
            
            const dossiers = await DossierService.getAllDossiers(
                { statut, date_debut, date_fin, recherche, limite, decalage },
                req.user.id,
                req.user.role
            );
            
            res.json({ success: true, data: dossiers });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    
    // Récupérer un dossier par ID
    async getDossierById(req, res) {
        try {
            const dossier = await DossierService.getDossierById(
                req.params.id,
                req.user.id,
                req.user.role
            );
            
            if (!dossier) {
                return res.status(404).json({ success: false, error: "Dossier non trouvé" });
            }
            
            res.json({ success: true, data: dossier });
        } catch (err) {
            res.status(403).json({ success: false, error: err.message });
        }
    },
    
    // Mettre à jour un dossier
    async updateDossier(req, res) {
        try {
            const dossier = await DossierService.updateDossier(
                req.params.id,
                req.body,
                req.user.id,
                req.user.role
            );
            
            res.json({ success: true, data: dossier });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    
    // Supprimer un dossier
    async deleteDossier(req, res) {
        try {
            await DossierService.deleteDossier(
                req.params.id,
                req.user.id,
                req.user.role
            );
            
            res.json({ success: true, data: "Dossier supprimé avec succès" });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    
    // Statistiques
    async getStatistics(req, res) {
        try {
            if (!['admin', 'directeur'].includes(req.user.role)) {
                return res.status(403).json({ success: false, error: "Accès non autorisé" });
            }
            
            const stats = await DossierService.getStatistics(req.user.id, req.user.role);
            res.json({ success: true, data: stats });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    
    // Gestion des tâches
    async createTask(req, res) {
        try {
            const task = await TaskService.createTask(
                req.body,
                req.params.dossierId,
                req.user.id,
                req.user.role
            );
            
            res.status(201).json({ success: true, data: task });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    
    async getTasks(req, res) {
        try {
            const tasks = await TacheService.getTasksByDossier(
                req.params.dossierId,
                req.user.id,
                req.user.role
            );
            
            res.json({ success: true, data: tasks });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    
    async updateTask(req, res) {
        try {
            const task = await TacheService.updateTask(
                req.params.taskId,
                req.body,
                req.user.id,
                req.user.role
            );
            
            res.json({ success: true, data: task });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    
    async validateTaskCompletion(req, res) {
        try {
            const { approuve, commentaires } = req.body;
            const result = await TacheService.validateCompletion(
                req.params.taskId,
                req.user.id,
                req.user.role,
                approuve,
                commentaires
            );
            
            res.json({ success: true, data: result });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }
};