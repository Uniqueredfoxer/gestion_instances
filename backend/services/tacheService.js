import db from '../database/db.js';

export const TacheService = {
    async createTask(taskData, dossierId, userId, userRole) {
        const { libelle, date_fin, intervenants = [] } = taskData;
        const dossierCheck = await db.query(
            `SELECT cree_par FROM dossiers WHERE id = $1`,
            [dossierId]
        );
        
        if (!dossierCheck.rows[0]) {
            throw new Error("Dossier non trouvé");
        }
        
        if (dossierCheck.rows[0].cree_par !== userId && !['admin', 'directeur'].includes(userRole)) {
            throw new Error("Seul le créateur du dossier peut ajouter des tâches");
        }
        
        
        const id_responsable = intervenants.length > 0 ? intervenants[0].utilisateur_id : null;
        if (!id_responsable) throw new Error("Un intervenant est requis");

        const taskResult = await db.query(
            `INSERT INTO taches (libelle, date_fin, id_dossier, cree_par, id_responsable)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [libelle, date_fin, dossierId, userId, id_responsable]
        );
        
        const task = taskResult.rows[0];
        
        return task;
    },
    
    async getTasksByDossier(dossierId, userId, userRole) {
        const query = `
            SELECT t.*, CONCAT(u.nom, ' ', u.prenom) as responsable
            FROM taches t
            LEFT JOIN users u ON t.id_responsable = u.id
            WHERE t.id_dossier = $1
            ORDER BY t.date_creation DESC
        `;
        
        const result = await db.query(query, [dossierId]);
        return result.rows;
    },
    
  
    async requestCompletion(taskId, userId) {
        const assignmentCheck = await db.query(
            `SELECT * FROM taches 
             WHERE id = $1 AND id_responsable = $2`,
            [taskId, userId]
        );
        
        if (assignmentCheck.rows.length === 0) {
            throw new Error("Vous n'êtes pas assigné à cette tâche");
        }
        
        const existingRequest = await db.query(
            `SELECT * FROM demandes_validation 
             WHERE id_tache = $1 AND statut = 'en_attente'`,
            [taskId]
        );
        
        if (existingRequest.rows.length > 0) {
            throw new Error("Une demande de validation est déjà en attente");
        }
        
        const result = await db.query(
            `INSERT INTO demandes_validation (id_tache, demandee_par)
             VALUES ($1, $2)
             RETURNING *`,
            [taskId, userId]
        );
        
        await db.query(
            `UPDATE taches SET demande_validation_le = NOW(), demande_validation_par = $1
             WHERE id = $2`,
            [userId, taskId]
        );
        
        return result.rows[0];
    },
    
    async validateCompletion(taskId, userId, userRole, approuve, commentaires) {
        const taskCheck = await db.query(
            `SELECT t.*, d.cree_par 
             FROM taches t
             JOIN dossiers d ON t.id_dossier = d.id
             WHERE t.id = $1`,
            [taskId]
        );
        
        if (!taskCheck.rows[0]) {
            throw new Error("Tâche non trouvée");
        }
        
        const task = taskCheck.rows[0];
        
        if (task.cree_par !== userId && !['admin', 'directeur'].includes(userRole)) {
            throw new Error("Seul le créateur du dossier peut valider les tâches");
        }
        
        await db.query(
            `UPDATE demandes_validation 
             SET statut = $1, traitee_par = $2, traitee_le = NOW(), commentaires = $3
             WHERE id_tache = $4 AND statut = 'en_attente'`,
            [approuve ? 'approuvee' : 'rejetee', userId, commentaires, taskId]
        );
        
        if (approuve) {
            const result = await db.query(
                `UPDATE taches 
                 SET statut = 'termine', 
                     avancement = 100,
                     valide_par = $1,
                     valide_le = NOW()
                 WHERE id = $2
                 RETURNING *`,
                [userId, taskId]
            );
            return result.rows[0];
        } else {
            await db.query(
                `UPDATE taches 
                 SET demande_validation_le = NULL, demande_validation_par = NULL
                 WHERE id = $1`,
                [taskId]
            );
            return { message: "Demande de validation rejetée", id_tache: taskId };
        }
    },
    
    async updateTask(taskId, updates, userId, userRole) {
        const taskCheck = await db.query(
            `SELECT t.*, d.cree_par 
             FROM taches t
             JOIN dossiers d ON t.id_dossier = d.id
             WHERE t.id = $1`,
            [taskId]
        );
        
        if (!taskCheck.rows[0]) {
            throw new Error("Tâche non trouvée");
        }
        
        const task = taskCheck.rows[0];
        
        const isAssignedIntervenant = task.id_responsable === userId;
        const isPrivileged = ['admin', 'directeur'].includes(userRole) || task.cree_par === userId;
        if (!isPrivileged && isAssignedIntervenant) {
            const allowedForIntervenant = ['statut'];
            const setClauses = [];
            const params = [];
            let paramCounter = 1;

            for (const [key, value] of Object.entries(updates)) {
                if (allowedForIntervenant.includes(key) && value !== undefined) {
                    setClauses.push(`${key} = $${paramCounter++}`);
                    params.push(value);
                }
            }

            if (setClauses.length === 0) {
                throw new Error("Aucun champ valide à mettre à jour");
            }

            params.push(taskId);
            const result = await db.query(
                `UPDATE taches SET ${setClauses.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
                params
            );
            return result.rows[0];
        }

        if (!isPrivileged) {
            throw new Error("Seul le créateur du dossier peut modifier cette tâche");
        }
        
        const allowedUpdates = ['libelle', 'description', 'date_fin', 'statut', 'id_responsable'];
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
        
        params.push(taskId);
        const result = await db.query(
            `UPDATE taches SET ${setClauses.join(', ')} 
             WHERE id = $${paramCounter}
             RETURNING *`,
            params
        );
        
        return result.rows[0];
    },
    
    async deleteTask(taskId) {
        if(!taskId){
            throw new Error('task Id was not provided')
        }
        try{
            db.query(`delete from taches where id=$1`, [taskId])
            return {success: true, data: 'tache supprimée avec succès'}
        }catch(err){
            console.log(err)
            return {success: false, error: err.message}
        }
    },
    async getMyTasks(userId) {
        const result = await db.query(
            `SELECT t.*, d.titre as titre_dossier, d.id as id_dossier
             FROM taches t
             JOIN dossiers d ON t.id_dossier = d.id
             WHERE t.id_responsable = $1
             ORDER BY t.date_fin ASC NULLS LAST`,
            [userId]
        );
        
        return result.rows;
    },

    async getMyStats(userId) {
    const query = `
        SELECT 
            COUNT(*) as total_taches,
            COUNT(CASE WHEN statut = 'termine' THEN 1 END) as taches_terminees,
            COUNT(CASE WHEN statut = 'en_cours' THEN 1 END) as taches_en_cours,
            COUNT(CASE WHEN statut = 'a_faire' THEN 1 END) as taches_a_faire,
            COUNT(CASE 
                WHEN statut != 'termine' 
                AND date_fin < CURRENT_DATE 
                THEN 1 
            END) as taches_en_retard,
            COUNT(CASE 
                WHEN statut != 'termine' 
                AND date_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days' 
                THEN 1 
            END) as taches_urgentes,
            COALESCE(ROUND(
                COUNT(CASE WHEN statut = 'termine' THEN 1 END)::numeric / 
                NULLIF(COUNT(*), 0) * 100, 2
            ), 0) as taux_achevement,
            COALESCE(ROUND(
                COUNT(CASE WHEN statut = 'termine' AND date_fin >= CURRENT_DATE THEN 1 END)::numeric / 
                NULLIF(COUNT(CASE WHEN statut = 'termine' THEN 1 END), 0) * 100, 2
            ), 0) as taux_ponctualite
        FROM taches
        WHERE id_responsable = $1
    `;

    const result = await db.query(query, [userId]);
    const stats = result.rows[0];

    return {
        totalTasks: parseInt(stats.total_taches) || 0,
        completedTasks: parseInt(stats.taches_terminees) || 0,
        inProgressTasks: parseInt(stats.taches_en_cours) || 0,
        pendingTasks: parseInt(stats.taches_en_attente) || 0,
        todoTasks: parseInt(stats.taches_a_faire) || 0,
        overdueTasks: parseInt(stats.taches_en_retard) || 0,
        urgentTasks: parseInt(stats.taches_urgentes) || 0,
        completionRate: parseFloat(stats.taux_achevement) || 0,
        onTimeRate: parseFloat(stats.taux_ponctualite) || 0,
        averageProgress: parseFloat(stats.avancement_moyen) || 0,
    };
}
};