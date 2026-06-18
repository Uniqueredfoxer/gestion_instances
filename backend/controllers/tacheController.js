import { TacheService } from '../services/tacheService.js';

export const TacheController = {
    async updateProgress(req, res) {
        try {
            const { avancement } = req.body;
            
            if (avancement < 0 || avancement > 100) {
                return res.status(400).json({ success: false, error: "L'avancement doit être entre 0 et 100" });
            }
            
            const task = await TaskService.updateProgress(
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
            const request = await TaskService.requestCompletion(
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
            const tasks = await TaskService.getMyTasks(req.user.id);
            res.json({ success: true, data: tasks });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }
};