import db from '../database/db.js';

export const TacheService = {
    async createTask(taskData, dossierId, userId, userRole) {
        const { libelle, date_debut, date_fin_prevue, intervenants = [] } = taskData;
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
        
        
        const id_intervenant = intervenants.length > 0 ? intervenants[0].utilisateur_id : null;
        if (!id_intervenant) throw new Error("Un intervenant est requis");

        const taskResult = await db.query(
            `INSERT INTO taches (libelle, date_debut, date_fin_prevue, id_dossier, cree_par, id_intervenant)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [libelle, date_debut, date_fin_prevue, dossierId, userId, id_intervenant]
        );
        
        const task = taskResult.rows[0];
        
        return task;
    },
    
    async getTasksByDossier(dossierId, userId, userRole) {
        const query = `
            SELECT t.*,
                   jsonb_build_array(jsonb_build_object(
                       'id', u.id,
                       'nom', u.nom,
                       'prenom', u.prenom,
                       'role', 'Intervenant'
                   )) as intervenants,
                   CASE 
                       WHEN t.demande_validation_le IS NOT NULL AND t.valide_le IS NULL 
                       THEN 'en_attente_validation'
                       WHEN t.valide_le IS NOT NULL THEN 'validee'
                       ELSE 'active'
                   END as statut_validation
            FROM taches t
            LEFT JOIN users u ON t.id_intervenant = u.id
            WHERE t.id_dossier = $1
            ORDER BY t.date_creation DESC
        `;
        
        const result = await db.query(query, [dossierId]);
        return result.rows;
    },
    

    async updateProgress(taskId, avancement, userId) {
        const assignmentCheck = await db.query(
            `SELECT * FROM taches 
             WHERE id = $1 AND id_intervenant = $2`,
            [taskId, userId]
        );
        
        if (assignmentCheck.rows.length === 0) {
            throw new Error("Vous n'êtes pas assigné à cette tâche");
        }
        

        const result = await db.query(
            `UPDATE taches 
             SET avancement = $1,
                 statut = CASE 
                     WHEN $1 = 100 THEN 'termine'
                     WHEN $1 > 0 AND $1 < 100 THEN 'en_cours'
                     ELSE 'a_faire'
                 END
             WHERE id = $2
             RETURNING *`,
            [avancement, taskId]
        );
        
        return result.rows[0];
    },
    
  
    async requestCompletion(taskId, userId) {
        const assignmentCheck = await db.query(
            `SELECT * FROM taches 
             WHERE id = $1 AND id_intervenant = $2`,
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
        
        // Créer la demande de validation
        const result = await db.query(
            `INSERT INTO demandes_validation (id_tache, demandee_par)
             VALUES ($1, $2)
             RETURNING *`,
            [taskId, userId]
        );
        
        // Mettre à jour la tâche
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
        
        // Mettre à jour la demande de validation
        await db.query(
            `UPDATE demandes_validation 
             SET statut = $1, traitee_par = $2, traitee_le = NOW(), commentaires = $3
             WHERE id_tache = $4 AND statut = 'en_attente'`,
            [approuve ? 'approuvee' : 'rejetee', userId, commentaires, taskId]
        );
        
        if (approuve) {
            // Marquer la tâche comme terminée
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
            // Réinitialiser la demande
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
        
        const isAssignedIntervenant = task.id_intervenant === userId;
        const isPrivileged = ['admin', 'directeur'].includes(userRole) || task.cree_par === userId;

        // Intervenants can only update the statut of their own tasks
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
        
        const allowedUpdates = ['libelle', 'description', 'date_debut', 'date_fin_prevue', 'statut', 'id_intervenant'];
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
    
    async getMyTasks(userId) {
        const result = await db.query(
            `SELECT t.*, d.titre as titre_dossier, d.id as id_dossier,
                    CASE 
                        WHEN t.demande_validation_le IS NOT NULL AND t.valide_le IS NULL 
                        THEN 'en_attente_validation'
                        ELSE 'active'
                    END as statut_validation
             FROM taches t
             JOIN dossiers d ON t.id_dossier = d.id
             WHERE t.id_intervenant = $1
             ORDER BY t.date_fin_prevue ASC NULLS LAST`,
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
                AND date_fin_prevue < CURRENT_DATE 
                THEN 1 
            END) as taches_en_retard,
            COUNT(CASE 
                WHEN statut != 'termine' 
                AND date_fin_prevue BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days' 
                THEN 1 
            END) as taches_urgentes,
            COALESCE(ROUND(AVG(CASE WHEN statut = 'termine' THEN 100 ELSE avancement END), 2), 0) as avancement_moyen,
            COALESCE(ROUND(
                COUNT(CASE WHEN statut = 'termine' THEN 1 END)::numeric / 
                NULLIF(COUNT(*), 0) * 100, 2
            ), 0) as taux_achevement,
            COALESCE(ROUND(
                COUNT(CASE WHEN statut = 'termine' AND date_fin_prevue >= CURRENT_DATE THEN 1 END)::numeric / 
                NULLIF(COUNT(CASE WHEN statut = 'termine' THEN 1 END), 0) * 100, 2
            ), 0) as taux_ponctualite
        FROM taches
        WHERE id_intervenant = $1
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