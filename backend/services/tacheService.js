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
        
        if (dossierCheck.rows[0].cree_par !== userId && userRole !== 'admin') {
            throw new Error("Seul le créateur du dossier peut ajouter des tâches");
        }
        
        
        const taskResult = await db.query(
            `INSERT INTO taches (libelle, date_debut, date_fin_prevue, id_dossier, cree_par)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [libelle, date_debut, date_fin_prevue, dossierId, userId]
        );
        
        const task = taskResult.rows[0];
        
        for (const interv of intervenants) {
            await db.query(
                `INSERT INTO tache_intervenants (id_tache, id_intervenant, intervention, assignee_par)
                 VALUES ($1, $2, $3, $4)`,
                [task.id, interv.utilisateur_id, interv.role, userId]
            );
        }
        
        return task;
    },
    
    async getTasksByDossier(dossierId, userId, userRole) {
        const query = `
            SELECT t.*,
                   array_agg(DISTINCT jsonb_build_object(
                       'id', u.id,
                       'nom', u.nom,
                       'prenom', u.prenom,
                       'role', ti.intervention
                   )) as intervenants,
                   CASE 
                       WHEN t.demande_validation_le IS NOT NULL AND t.valide_le IS NULL 
                       THEN 'en_attente_validation'
                       WHEN t.valide_le IS NOT NULL THEN 'validee'
                       ELSE 'active'
                   END as statut_validation
            FROM taches t
            LEFT JOIN tache_intervenants ti ON t.id = ti.id_tache
            LEFT JOIN users u ON ti.id_intervenant = u.id
            WHERE t.id_dossier = $1
            GROUP BY t.id
            ORDER BY t.date_creation DESC
        `;
        
        const result = await db.query(query, [dossierId]);
        return result.rows;
    },
    

    async updateProgress(taskId, avancement, userId) {
        const assignmentCheck = await db.query(
            `SELECT * FROM tache_intervenants 
             WHERE id_tache = $1 AND id_intervenant = $2`,
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
            `SELECT * FROM tache_intervenants 
             WHERE id_tache = $1 AND id_intervenant = $2`,
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
    
    // Valider ou rejeter une tâche (créateur du dossier ou admin)
    async validateCompletion(taskId, userId, userRole, approuve, commentaires) {
        // Vérifier que l'utilisateur peut valider (créateur du dossier ou admin)
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
        
        if (task.cree_par !== userId && userRole !== 'admin') {
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
    
    // Mettre à jour une tâche (créateur du dossier uniquement)
    async updateTask(taskId, updates, userId, userRole) {
        // Vérifier les permissions
        const taskCheck = await db.query(
            `SELECT t.*, d.cree_par 
             FROM tache t
             JOIN dossier d ON t.id_dossier = d.id
             WHERE t.id = $1`,
            [taskId]
        );
        
        if (!taskCheck.rows[0]) {
            throw new Error("Tâche non trouvée");
        }
        
        const task = taskCheck.rows[0];
        
        if (task.cree_par !== userId && userRole !== 'admin') {
            throw new Error("Seul le créateur du dossier peut modifier cette tâche");
        }
        
        const allowedUpdates = ['libelle', 'date_debut', 'date_fin_prevue'];
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
                    ti.role_intervention,
                    CASE 
                        WHEN t.demande_validation_le IS NOT NULL AND t.valide_le IS NULL 
                        THEN 'en_attente_validation'
                        ELSE 'active'
                    END as statut_validation
             FROM taches t
             JOIN tache_intervenants ti ON t.id = ti.id_tache
             JOIN dossiers d ON t.id_dossier = d.id
             WHERE ti.id_intervenant = $1
             ORDER BY t.date_fin_prevue ASC NULLS LAST`,
            [userId]
        );
        
        return result.rows;
    }
};