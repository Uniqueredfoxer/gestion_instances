import { UserService } from '../services/userService.js';

export const UserController = {

    async getAllUsers(req, res) {
        try {
            console.log(req.user.role)
            if (req.user.role !== 'admin' && req.user.role !== 'directeur') {
                return res.status(403).json({ error: "Accès administrateur requis" });
            }
            
            const { role, statut, recherche } = req.query;
            const users = await UserService.getAllUsers({ role, statut, recherche });
            res.json({ success: true, data: users });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    
 
    async getUserById(req, res) {
        try {
            // Admin peut voir n'importe qui, les autres seulement eux-mêmes
            if (req.user.role !== 'admin' && req.user.role !== 'directeur' && parseInt(req.params.id) !== req.user.id) {
                return res.status(403).json({ success: false, error: "Accès non autorisé" });
            }
            
            const user = await UserService.getUserById(req.params.id);
            if (!user) {
                return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
            }
            
            res.json({ success: true, data: user });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    

    async createUser(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ success: false, error: "Accès administrateur requis" });
            }
            
            const user = await UserService.createUser(req.body);
            const result = await AuthService.registerUser(req.body);
    
            if (!result.success) {
        if (result.error === "Missing required fields" ||
            result.error === "Invalid email format" ||
            result.error === "Password must be at least 8 characters long" ||
            result.error === "Password must contain at least one uppercase letter, one lowercase letter, and one number" ||
            result.error === "First name must be between 2 and 50 characters" ||
            result.error === "Last name must be between 2 and 50 characters") {
            return res.status(400).json(result);
        }
        if (result.error === "User already exists") {
            return res.status(409).json(result);
        }

        return res.status(500).json(result);
    }
    
    res.status(201).json(result);
            res.status(201).json({ success: true, data: user });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    

    async updateUser(req, res) {
        try {
            console.log
            if (req.user.role !== 'admin' && parseInt(req.params.id) !== req.user.id) {
                return res.status(403).json({ success: false, error: "Accès non autorisé" });
            }
            
            if (req.user.role !== 'admin' && req.body.role_dir) {
                delete req.body.role_dir;
            }
            
            const user = await UserService.updateUser(req.params.id, req.body);
            res.json({ success: true, data: user });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    

    async deleteUser(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ success: false, error: "Accès administrateur requis" });
            }
            
            if (parseInt(req.params.id) === req.user.id) {
                return res.status(400).json({ success: false, error: "Vous ne pouvez pas vous supprimer vous-même" });
            }
            
            const result = await UserService.deleteUser(req.params.id);
            res.json({ success: true, data: result });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    

    async getWorkerPerformance(req, res) {
        try {
            if (!['admin', 'directeur'].includes(req.user.role)) {
                return res.status(403).json({ success: false, error: "Accès non autorisé" });
            }
            
            const performance = await UserService.getWorkerPerformance(req.user.id, req.user.role);
            res.json({ success: true, performances: performance });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }
};