import db from '../database/db.js';

export const DossierService = {
    async createDossier(dossierData, userId, userRole) {
        const { titre, description, date_limite, id_instance } = dossierData;
        
        if (!titre || !date_limite) {
            throw new Error("Le titre et la date limite sont requis");
        }
        
        const result = await db.query(
            `INSERT INTO dossier (titre, description, date_limite, id_instance, cree_par)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [titre, description, date_limite, id_instance, userId]
        );
        
        return result.rows[0];
    },
    
    async getAllDossiers(filters = {}, userId, userRole) {
        let query = `
            SELECT d.*, 
                   u.nom || ' ' || u.prenom as cree_par,
                   i.nom as instance,
                   COUNT(DISTINCT t.id) as total_taches,
                   COALESCE(ROUND(AVG(t.avancement), 2), 0) as taux_achevement
            FROM dossiers d
            LEFT JOIN users u ON d.cree_par = u.id
            LEFT JOIN instances i ON d.id_instance = i.id
            LEFT JOIN taches t ON d.id = t.id_dossier
        `;
        
        const conditions = [];
        const params = [];
        let paramCounter = 1;
        
        if (filters.statut) {
            conditions.push(`d.statut = $${paramCounter++}`);
            params.push(filters.statut);
        }
        
        if (filters.date_debut && filters.date_fin) {
            conditions.push(`d.date_limite BETWEEN $${paramCounter++} AND $${paramCounter++}`);
            params.push(filters.date_debut, filters.date_fin);
        }
        
        if (filters.recherche) {
            conditions.push(`(d.titre ILIKE $${paramCounter++} OR d.description ILIKE $${paramCounter++})`);
            params.push(`%${filters.recherche}%`, `%${filters.recherche}%`);
        }
        
        if (userRole !== 'admin') {
            conditions.push(`d.cree_par = $${paramCounter++}`);
            params.push(userId);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ` GROUP BY d.id, u.nom, u.prenom, i.nom
                   ORDER BY d.date_creation DESC`;
        
        if (filters.limite) {
            query += ` LIMIT $${paramCounter++}`;
            params.push(filters.limite);
        }
        
        if (filters.decalage) {
            query += ` OFFSET $${paramCounter++}`;
            params.push(filters.decalage);
        }
        
        const result = await db.query(query, params);
        return result.rows;
    },
    
    async getDossierById(dossierId, userId, userRole) {
        if (userRole !== 'admin') {
            const permissionCheck = await db.query(
                `SELECT cree_par FROM dossiers WHERE id = $1`,
                [dossierId]
            );
            if (permissionCheck.rows[0]?.cree_par !== userId) {
                throw new Error("Accès non autorisé");
            }
        }
        
        const result = await db.query(
            `SELECT d.*, 
                    u.nom || ' ' || u.prenom as cree_par_nom,
                    i.nom as instance_nom,
                    COUNT(t.id) as total_taches
             FROM dossiers d
             LEFT JOIN users u ON d.cree_par = u.id
             LEFT JOIN instances i ON d.id_instance = i.id
             LEFT JOIN taches t ON d.id = t.id_dossier
             WHERE d.id = $1
             GROUP BY d.id, u.nom, u.prenom, i.nom`,
            [dossierId]
        );
        
        return result.rows[0];
    },
    
    async updateDossier(dossierId, updates, userId, userRole) {
        if (userRole !== 'admin') {
            const permissionCheck = await db.query(
                `SELECT cree_par FROM dossiers WHERE id = $1`,
                [dossierId]
            );
            if (permissionCheck.rows[0]?.cree_par !== userId) {
                throw new Error("Accès non autorisé");
            }
        }
        
        const allowedUpdates = ['titre', 'description', 'date_limite', 'id_instance'];
        const setClauses = [];
        const params = [];
        let paramCounter = 1;
        
        for (const [key, value] of Object.entries(updates)) {
            if (allowedUpdates.includes(key) && value !== undefined) {
                setClauses.push(`${key} = $${paramCounter++}`);
                params.push(value);
            }
        }
        
        if (setClauses.length === 0) {
            throw new Error("Aucun champ valide à mettre à jour");
        }
        
        params.push(dossierId);
        const result = await db.query(
            `UPDATE dossiers SET ${setClauses.join(', ')} 
             WHERE id = $${paramCounter}
             RETURNING *`,
            params
        );
        
        return result.rows[0];
    },
    
  
    async deleteDossier(dossierId, userId, userRole) {
        if (userRole !== 'admin') {
            const permissionCheck = await db.query(
                `SELECT cree_par FROM dossiers WHERE id = $1`,
                [dossierId]
            );
            if (permissionCheck.rows[0]?.cree_par !== userId) {
                throw new Error("Accès non autorisé");
            }
        }
        
        const taskCheck = await db.query(
            `SELECT COUNT(*) FROM taches WHERE id_dossier = $1`,
            [dossierId]
        );
        
        if (parseInt(taskCheck.rows[0].count) > 0 && userRole !== 'admin') {
            throw new Error("Impossible de supprimer un dossier avec des tâches existantes. Supprimez d'abord les tâches ou contactez l'administrateur.");
        }
        
        const result = await db.query(
            `DELETE FROM dossiers WHERE id = $1 RETURNING id`,
            [dossierId]
        );
        
        return result.rows[0];
    },
    

    async getStatistics(userId, userRole) {
        let query = `
        SELECT 
                COUNT(DISTINCT d.id) as totalDossiers,
                (SELECT COUNT(*) from users) AS totalUsers,
                COUNT(DISTINCT CASE WHEN d.statut = 'boucle' THEN d.id END) as dossiers_termines,
                COUNT(DISTINCT t.id) as totalTasks,
                COUNT(DISTINCT CASE WHEN t.statut = 'termine' THEN t.id END) as taches_terminees,
                COALESCE(ROUND(AVG(t.avancement), 2), 0) as completionRate,
                COUNT(DISTINCT t.id_intervenant) as activeUsers
            FROM dossiers d
            LEFT JOIN taches t ON d.id = t.id_dossier
            LEFT JOIN users u ON u.id = t.id_intervenant
        `;
        
        const params = [];
        
        if (userRole !== 'admin') {total_dossier
            query += ` WHERE d.cree_par = $1`;
            params.push(userId);
        }
        
        const result = await db.query(query, params);
        
        
        const lateTasks = await db.query(
            `SELECT COUNT(*) as taches_en_retard
             FROM taches t
             JOIN dossiers d ON t.id_dossier = d.id
             WHERE t.date_fin_prevue < CURRENT_DATE 
               AND t.statut != 'termine'
               ${userRole !== 'admin' ? 'AND d.cree_par = $1' : ''}`,
            userRole !== 'admin' ? [userId] : []
        );
        
        return {
            ...result.rows[0],
            taches_en_retard: parseInt(lateTasks.rows[0].taches_en_retard)
        };
    }
};