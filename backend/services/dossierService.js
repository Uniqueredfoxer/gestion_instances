import db from '../database/db.js';

export const DossierService = {
    async createDossier(dossierData, userId, userRole) {
        const { titre, description, date_limite,  id_responsable } = dossierData;
        console.log('received: ', dossierData)
        if (!titre || !date_limite) {
            throw new Error("Le titre et la date limite sont requis");
        }
        
        const result = await db.query(
            `INSERT INTO dossiers (titre, description, date_limite, cree_par, id_responsable )
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [titre, description, date_limite, userId, id_responsable]
        );
        
        return result.rows[0];
    },
    
    async getAllDossiers(filters = {}, userId, userRole) {
        let query = `
            SELECT d.*, 
                   u1.nom || ' ' || u1.prenom as cree_par,
                   u2.nom || ' ' || u2.prenom as responsable,
                   COUNT(DISTINCT t.id) as total_tache,
                   COUNT(DISTINCT CASE WHEN t.statut = 'termine' THEN t.id END) as taches_terminees
            FROM dossiers d
            LEFT JOIN users u1 ON d.cree_par = u1.id
            LEFT JOIN users u2 ON d.id_responsable = u2.id
            LEFT JOIN taches t ON d.id = t.id_dossier
        `;
        
        const conditions = [];
        const params = [];
        let paramCounter = 1;
        
        if (filters.statut) {
            conditions.push(`d.statut = $${paramCounter++}`);
            params.push(filters.statut);
        }
        
        if (filters.date_limite) {
            conditions.push(`d.date_limite BETWEEN $${paramCounter++} AND $${paramCounter++}`);
            params.push(filters.date_limite);
        }
        
        if (filters.recherche) {
            conditions.push(`(d.titre ILIKE $${paramCounter++} OR d.description ILIKE $${paramCounter++})`);
            params.push(`%${filters.recherche}%`, `%${filters.recherche}%`);
        }
        
        if (userRole !== 'admin' && userRole !== 'directeur' ) {
            conditions.push(`d.cree_par = $${paramCounter++}`);
            params.push(userId);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ` GROUP BY d.id, u1.nom, u1.prenom, u2.nom, u2.prenom
                   ORDER BY d.date_limite ASC`;
        
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
        if (userRole !== 'admin' && userRole !== 'directeur') {
            const permissionCheck = await db.query(
                `SELECT cree_par FROM dossiers WHERE id = $1`,
                [dossierId]
            );
            if (permissionCheck.rows[0]?.cree_par !== userId) {
                throw new Error("Accès non autorisé");
            }
        }
        
        const allowedUpdates = ['titre', 'description', 'date_limite', 'statut', 'id_responsable'];
        const setClauses = [];
        const params = [];
        let paramCounter = 1;
        
        for (const [key, value] of Object.entries(updates)) {
            if (allowedUpdates.includes(key) && value !== undefined) {
                setClauses.push(`${key} = $${paramCounter++}`);
                params.push(value);
            }
        }
        
        if (updates.statut === 'boucle') {
            const currentDossier = await db.query('SELECT boucle_le FROM dossiers WHERE id = $1', [dossierId]);
            if (!currentDossier.rows[0].boucle_le) {
                setClauses.push(`boucle_le = CURRENT_DATE`);
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
        if (!['admin', 'directeur'].includes(userRole)) {
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
        
        if (parseInt(taskCheck.rows[0].count) > 0 && !['admin', 'directeur'].includes(userRole)) {
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
                COUNT(DISTINCT d.id) as total_dossiers,
                (SELECT COUNT(*) from users) AS total_users,
                COUNT(DISTINCT CASE WHEN d.statut = 'boucle' THEN d.id END) as dossiers_termines,
                COUNT(DISTINCT CASE WHEN d.statut = 'boucle' AND (d.boucle_le <= date_limite OR d.boucle_le IS NULL) THEN d.id END) as dossiers_termines_a_temps,
                COUNT(DISTINCT CASE WHEN d.statut !='boucle' AND d.date_limite < CURRENT_DATE then d.id END) as dossier_en_retard,
                COUNT(DISTINCT t.id) as total_taches ,
                COUNT(DISTINCT CASE WHEN t.statut = 'termine' THEN t.id END) as taches_terminees,
                COUNT(DISTINCT t.id_responsable) as active_users
            FROM dossiers d
            LEFT JOIN taches t ON d.id = t.id_dossier
            LEFT JOIN users u ON u.id = t.id_responsable
        `;
        
        const params = [];
        
        if (!['admin', 'directeur'].includes(userRole)) {
            query += ` WHERE d.cree_par = $1`;
            params.push(userId);
        }
        
        const result = await db.query(query, params);
        
        
        const lateTasks = await db.query(
            `SELECT COUNT(*) as taches_en_retard
             FROM taches t
             JOIN dossiers d ON t.id_dossier = d.id
             WHERE t.date_fin < CURRENT_DATE 
               AND t.statut != 'termine'
               ${!['admin', 'directeur'].includes(userRole) ? 'AND d.cree_par = $1' : ''}`,
            !['admin', 'directeur'].includes(userRole) ? [userId] : []
        );
        
        const dossiersParResponsable = await db.query(
            `SELECT u.nom, u.prenom, COUNT(d.id) as count
             FROM users u
             JOIN dossiers d ON d.id_responsable = u.id
             ${!['admin', 'directeur'].includes(userRole) ? 'WHERE d.cree_par = $1' : ''}
             GROUP BY u.id, u.nom, u.prenom
             ORDER BY count DESC`,
            !['admin', 'directeur'].includes(userRole) ? [userId] : []
        );

        const tachesParIntervenant = await db.query(
            `SELECT u.nom, u.prenom, COUNT(t.id) as count
             FROM users u
             JOIN taches t ON t.id_responsable = u.id
             JOIN dossiers d ON t.id_dossier = d.id
             ${!['admin', 'directeur'].includes(userRole) ? 'WHERE d.cree_par = $1' : ''}
             GROUP BY u.id, u.nom, u.prenom
             ORDER BY count DESC`,
            !['admin', 'directeur'].includes(userRole) ? [userId] : []
        );

        return {
            ...result.rows[0],
            taches_en_retard: parseInt(lateTasks.rows[0].taches_en_retard),
            dossiers_par_responsable: dossiersParResponsable.rows,
            nbre_taches_par_intervenant: tachesParIntervenant.rows
        };
    }
};