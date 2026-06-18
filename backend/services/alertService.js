import db from "../database/db.js";


export const AlertService = {
  getAll: async ()=> {
    const query = `
      SELECT 
        a.*,
        d.titre as titre_dossier,
        u.prenom as prenom_destinataire,
        u.nom as nom_destinataire
      FROM alertes a
      LEFT JOIN dossiers d ON a.id_dossier = d.id
      LEFT JOIN users u ON a.id_destinataire = u.id
      ORDER BY a.date_creation DESC
    `;
    
    const result = await db.query(query);
    return result.rows;
  },

  getByDossier: async (dossierId)=> {
    const query = `
      SELECT 
        a.*,
        d.titre as titre_dossier,
        u.prenom as prenom_destinataire,
        u.nom as nom_destinataire
      FROM alertes a
      LEFT JOIN dossiers d ON a.id_dossier = d.id
      LEFT JOIN users u ON a.id_destinataire = u.id
      WHERE a.id_dossier = $1
      ORDER BY a.date_creation DESC
    `;
    
    const result = await db.query(query, [dossierId]);
    return result.rows;
  },


  getByDestinataire: async (userId)=> {
    const query = `
      SELECT 
        a.*,
        d.titre as titre_dossier,
        u.prenom as prenom_destinataire,
        u.nom as nom_destinataire
      FROM alertes a
      LEFT JOIN dossiers d ON a.id_dossier = d.id
      LEFT JOIN users u ON a.id_destinataire = u.id
      WHERE a.id_destinataire = $1
      ORDER BY a.date_creation DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  getUnreadByUser: async (userId)=> {
    const query = `
      SELECT 
        a.*,
        d.titre as titre_dossier,
        u.prenom as prenom_destinataire,
        u.nom as nom_destinataire
      FROM alertes a
      LEFT JOIN dossiers d ON a.id_dossier = d.id
      LEFT JOIN users u ON a.id_destinataire = u.id
      WHERE a.id_destinataire = $1 AND a.statut_lecture = false
      ORDER BY a.date_creation DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  getById: async (id)=> {
    const query = `
      SELECT 
        a.*,
        d.titre as titre_dossier,
        u.prenom as prenom_destinataire,
        u.nom as nom_destinataire
      FROM alertes a
      LEFT JOIN dossiers d ON a.id_dossier = d.id
      LEFT JOIN users u ON a.id_destinataire = u.id
      WHERE a.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },


  create: async (data)=> {
    const query = `
      INSERT INTO alertes (message, id_dossier, id_destinataire)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      data.message,
      data.id_dossier,
      data.id_destinataire
    ]);
    
    return result.rows[0];
  },

  markAsRead: async (id)=> {
    const query = `
      UPDATE alertes 
      SET statut_lecture = true
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  markAllAsRead: async (userId)=> {
    const query = `
      UPDATE alertes 
      SET statut_lecture = true
      WHERE id_destinataire = $1 AND statut_lecture = false
      RETURNING id
    `;
    
    const result = await db.query(query, [userId]);
    return result.rowCount || 0;
  },

  delete: async (id)=> {
    const query = `
      DELETE FROM alertes 
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await db.query(query, [id]);
    return (result.rowCount || 0) > 0;
  },


  deleteByDossier: async (dossierId)=> {
    const query = `
      DELETE FROM alertes 
      WHERE id_dossier = $1
      RETURNING id
    `;
    
    const result = await db.query(query, [dossierId]);
    return result.rowCount || 0;
  },

  getUnreadCount: async (userId)=> {
    const query = `
      SELECT COUNT(*) as count
      FROM alertes 
      WHERE id_destinataire = $1 AND statut_lecture = false
    `;
    
    const result = await db.query(query, [userId]);
    return parseInt(result.rows[0].count) || 0;
  },


  createDueDateReminders: async ()=> {
    
    const query = `
      INSERT INTO alertes (message, id_dossier, id_destinataire)
      SELECT 
        CONCAT(
          'La tâche "', t.titre, '" du dossier ', d.titre, 
          ' est due le ', TO_CHAR(t.due_date, 'DD/MM/YYYY')
        ) as message,
        t.id_dossier as id_dossier,
        t.id_intervenant as id_intervenant
      FROM taches t
      JOIN dossiers d ON t.id_dossier = d.id
      LEFT JOIN alertes a ON (
        a.id_dossier = t.id_dossier 
        AND a.id_destinataire = t.id_intervenant
        AND a.message LIKE CONCAT('%', t.titre, '%')
      )
      WHERE t.date_fin_prevue BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
        AND t.status != 'termine'
        AND a.id IS NULL
      RETURNING id
    `;
    
    const result = await db.query(query);
    return result.rowCount || 0;
  }
};