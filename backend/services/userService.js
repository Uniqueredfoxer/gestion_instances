import db from '../database/db.js';
import bcrypt from 'bcryptjs';
import { validateEmail, validateName, validatePassword } from '../utils/validators.js';

export const UserService = {

    async getAllUsers(filters = {}) {
        let query = `
            SELECT id, nom, prenom, email, poste, role_dir, statut, date_creation
            FROM users
            WHERE 1=1
        `;
        
        const params = [];
        let paramCounter = 1;
        
        if (filters.role) {
            query += ` AND role_dir = $${paramCounter++}`;
            params.push(filters.role);
        }
        
        if (filters.statut) {
            query += ` AND statut = $${paramCounter++}`;
            params.push(filters.statut);
        }
        
        if (filters.recherche) {
            query += ` AND (nom ILIKE $${paramCounter++} OR prenom ILIKE $${paramCounter++} OR email ILIKE $${paramCounter++})`;
            params.push(`%${filters.recherche}%`, `%${filters.recherche}%`, `%${filters.recherche}%`);
        }
        
        query += ` ORDER BY nom, prenom`;
        
        const result = await db.query(query, params);
        return result.rows;
    },
    
  
    async getUserById(userId) {
        const result = await db.query(
            `SELECT id, nom, prenom, email, poste, role_dir, statut, date_creation
             FROM users WHERE id = $1`,
            [userId]
        );
        return result.rows[0];
    },
    

    async createUser(userData) {
        const { nom, prenom, email, mdp, poste} = userData;
            
        if (!nom || !prenom || !email || !mdp || !poste) {
            return { success: false, error: "Missing required fields" };
        }
            
        if (!validateName(nom)) {
            return { success: false, error: "First name must be between 2 and 50 characters" };
        }
            
        if (!validateName(prenom)) {
            return { success: false, error: "Last name must be between 2 and 50 characters" };
        }
            
        if (!validateEmail(email)) {
            return { success: false, error: "Invalid email format" };
        }
            
        if (!validatePassword(mdp)) {
            return { success: false, error: "Password must be at least 8 characters long" };
        }

        const hasUppercase = /[A-Z]/.test(mdp);
        const hasLowercase = /[a-z]/.test(mdp);
        const hasNumber = /[0-9]/.test(mdp);
            
        if (!hasUppercase || !hasLowercase || !hasNumber) {
            return { success: false, error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" };
        }
            
        try {
            const existingUser = await db.query(`SELECT email FROM users WHERE email = $1`, [email.toLowerCase()]);
            if (existingUser.rows.length > 0) {
                return { success: false, error: "User already exists" };
            }
                
            const hash = await bcrypt.hash(mdp, 10);
            const result = await db.query(
                    `INSERT INTO users(nom, prenom, email, mdp, poste) VALUES($1, $2, $3, $4, $5) RETURNING id, nom, prenom, email, role_dir`,
                    [nom.trim(), prenom.trim(), email.toLowerCase(), hash, poste]
                );
            const newUser = result.rows[0];
            const token = jwt.sign({id: newUser.id, email: newUser.email, role: newUser.role_dir}, JWT_SECRET, {expiresIn: JWT_EXPIRE_IN});
            return { success: true, data:{token: token, user: newUser} };
        } catch (err) {
            console.error("Error creating user: ", err);
            return { success: false, error: "Database error" };
        }
    },
    

    async updateUser(userId, updates) {
        const allowedUpdates = ['nom', 'prenom', 'email', 'poste', 'role_dir', 'statut'];
        const setClauses = [];
        const params = [];
        let paramCounter = 1;
        
        for (const [key, value] of Object.entries(updates)) {
            if (allowedUpdates.includes(key) && value !== undefined) {
                setClauses.push(`${key} = $${paramCounter++}`);
                params.push(value);
            }
        }   // Récupérer un utilisateur par ID
        
        if (updates.mdp) {
            const hashedPassword = await bcrypt.hash(updates.mdp, 10);
            setClauses.push(`mdp = $${paramCounter++}`);
            params.push(hashedPassword);
        }
        
        if (setClauses.length === 0) {
            throw new Error("Aucun champ valide à mettre à jour");
        }
        
        params.push(userId);
        const result = await db.query(
            `UPDATE users SET ${setClauses.join(', ')} 
             WHERE id = $${paramCounter}
             RETURNING id, nom, prenom, email, poste, role_dir, statut`,
            params
        );
        
        return result.rows[0];
    },
    
  
    async deleteUser(userId) {

        const taskCheck = await db.query(
            `SELECT COUNT(*) FROM taches WHERE id_responsable = $1`,
            [userId]
        );
        
        if (parseInt(taskCheck.rows[0].count) > 0) {
            const result = await db.query(
                `UPDATE users SET statut = 'inactif' WHERE id = $1 RETURNING id`,
                [userId]
            );
            return { ...result.rows[0], desactive: true };
        }
        
        const result = await db.query(
            `DELETE FROM users WHERE id = $1 RETURNING id`,
            [userId]
        );
        
        return result.rows[0];
    },
    

    async getWorkerPerformance(userId, userRole) {
        let query = `
            SELECT 
                u.id, u.nom, u.prenom,
                COUNT(DISTINCT t.id) as total_taches,
                COUNT(DISTINCT CASE WHEN t.statut = 'termine' THEN t.id END) as taches_terminees,
                COALESCE(ROUND(AVG(t.avancement), 2), 0) as taux_achevement_moyen,
                COUNT(DISTINCT d.id) as dossiers_impliques
            FROM users u
            LEFT JOIN taches t ON u.id = t.id_intervenant
            LEFT JOIN dossiers d ON t.id_dossier = d.id
        `;
        
        const params = [];
        
        if (userRole !== 'admin') {
            query += ` WHERE d.cree_par = $1`;
            params.push(userId);
        }
        
        query += ` GROUP BY u.id, u.nom, u.prenom
                   ORDER BY taux_achevement_moyen DESC`;
        
        const result = await db.query(query, params);
        return result.rows;
    }
};