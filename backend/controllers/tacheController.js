import { TacheService } from '../services/tacheService.js';

export const TacheController = {
    async updateProgress(req, res) {
        try {
            const { avancement } = req.body;
            
            if (avancement < 0 || avancement > 100) {
                return res.status(400).json({ success: false, error: "L'avancement doit être entre 0 et 100" });
            }
            
            const task = await TacheService.updateProgress(
                req.params.taskId,
                avancement,
                req.user.id
            );
            
            res.json({ success: true, data: task });
        } catch (err) {
            res.status(403).json({ success: false, error: err.message });
        }
    },
   
    async requestCompletion(req, res) {
        try {
            const request = await TacheService.requestCompletion(
                req.params.taskId,
                req.user.id
            );
            
            res.json({ success: true, data: request });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    
    async getMyTasks(req, res) {
        try {
            const tasks = await TacheService.getMyTasks(req.user.id);
            res.json({ success: true, data: tasks });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },

    async getMyStats(req, res) {
        try {
            const userId = req.user?.id;
            
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Non authentifié'
                });
            }

            const stats = await TacheService.getMyStats(userId);
            
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du chargement des statistiques',
                error: error.message
            });
        }
    }
};