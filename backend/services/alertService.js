import db from "../database/db.js";


export const AlertService = {
  getAll: async ()=> {
    const query = `
      SELECT 
        a.*,
        d.titre as titre_dossier,
        t.libelle as libelle_tache,
        u.prenom as prenom_dest,
        u.nom as nom_dest
      FROM alertes a
      LEFT JOIN dossiers d ON a.id_dossier = d.id
      LEFT JOIN taches t on t.id_dossier = d.id
      LEFT JOIN users u ON t.id_responsable = u.id
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
        t.libelle as libelle_tache,
        u.prenom as prenom_dest,
        u.nom as nom_dest
      FROM alertes a
      LEFT JOIN dossiers d ON a.id_dossier = d.id
      LEFT JOIN taches t on t.id_dossier = d.id
      LEFT JOIN users u ON t.id_responsable = u.id
      WHERE a.id_dossier = $1
      ORDER BY a.date_creation DESC
    `;
    
    const result = await db.query(query, [dossierId]);
    return result.rows;
  },


  getUserAlerts: async (userId)=> {
    const query = `
      SELECT 
        a.*,
        d.titre as titre_dossier,
        t.libelle as libelle_tache,
        u.prenom as prenom_dest,
        u.nom as nom_dest
      FROM alertes a
      LEFT JOIN dossiers d ON a.id_dossier = d.id
      LEFT JOIN taches t ON a.id_tache = t.id
      LEFT JOIN users u ON t.id_responsable = u.id
      WHERE u.id = $1
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
        t.libelle as libelle_tache,
        u.prenom as prenom_dest,
        u.nom as nom_dest
      FROM alertes a
      LEFT JOIN dossiers d ON a.id_dossier = d.id
      LEFT JOIN taches t ON a.id_tache = t.id
      LEFT JOIN users u ON t.id_responsable = u.id
      WHERE a.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },


  create: async (data)=> {
    const query = `
      INSERT INTO alertes (message, id_dossier, id_tache)
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

  


  createDueDateReminders: async ()=> {
    
    const query = `
      INSERT INTO alertes (message, id_dossier, id_tache)
      SELECT 
        CONCAT(
          'La tâche "', t.libelle, '" du dossier ', d.titre, 
          ' est due le ', TO_CHAR(t.date_fin, 'DD/MM/YYYY')
        ) as message,
        t.id_dossier as id_dossier,
        t.id_tache as id_tache
      FROM taches t
      JOIN dossiers d ON t.id_dossier = d.id
      LEFT JOIN alertes a ON (
        a.id_dossier = t.id_dossier 
        AND a.id_tache = t.id
        AND a.message LIKE CONCAT('%', t.libelle, '%')
      )
      WHERE t.date_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
        AND t.status != 'termine'
        AND a.id IS NULL
      RETURNING id
    `;
    
    const result = await db.query(query);
    return result.rowCount || 0;
  }
};