import { AlertService } from "../services/alertService.js";

export const AlertController = {
   getAllAlerts: async (req, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role_dir;
      
      let alerts;
      if (userRole === 'admin' || userRole === 'directeur') {
        alerts = await AlertService.getAll();
      } else {
        alerts = await AlertService.getUserAlerts(userId);
      }
      
      res.status(200).json({
        success: true,
        data:{alerts, count: alerts.length} 
      });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },
   getAlertById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      const alert = await AlertService.getById(parseInt(id));
      
      if (!alert)
        return res.status(404).json({
          success: false,
          error: 'Alert not found'
        });
      }
  
      if (userRole !== 'admin' && userRole !== 'directeur' && 
          alert.id_destinataire !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have permission to view this alert'
        });
      }
      
      res.status(200).json({
        success: true,
        data: alert
      });
    } catch (error) {
      console.error('Error fetching alert:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error' + error.message,
      });
    }
  },
   getAlertsByDossier: async (req, res) => {
    try {
      const { dossierId } = req.params;
      
      const alerts = await AlertService.getByDossier(parseInt(dossierId));
      
      res.status(200).json({
        success: true,
        data: alerts,
        count: alerts.length
      });
    } catch (error) {
      console.error('Error fetching alerts by dossier:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },
   getUserAlerts: async (req, res) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role_dir;
      const alerts = await AlertService.getUserAlerts(parseInt(userId));
      
      res.status(200).json({
        success: true,
        data: alerts,
        count: alerts.length
      });
    } catch (error) {
      console.error('Error fetching alerts by user:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },
   createAlert: async (req, res) => {
    try {
      const { message, id_dossier, id_destinataire } = req.body;
      
      if (!message || !id_dossier || !id_destinataire) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: message, id_dossier, id_destinataire'
        });
      }
      
      const alert = await AlertService.create({
        message,
        id_dossier: parseInt(id_dossier),
        id_destinataire: parseInt(id_destinataire)
      });
      
      res.status(201).json({
        success: true,
        message: 'Alert created successfully',
        data: alert
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },
   deleteAlert: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      const alert = await AlertService.getById(parseInt(id));
      
      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }
      
      if (userRole !== 'admin' && userRole !== 'directeur' && 
          alert.id_destinataire !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to delete this alert'
        });
      }
      
      const deleted = await AlertService.delete(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Alert deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },
   deleteAlertsByDossier: async (req, res) => {
    try {
      const { dossierId } = req.params;
      const userRole = req.user?.role;
  
      if (userRole !== 'admin' && userRole !== 'directeur') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only administrators can delete alerts by dossier'
        });
      }
      
      const count = await AlertService.deleteByDossier(parseInt(dossierId));
      
      res.status(200).json({
        success: true,
        message: `${count} alerts deleted for dossier`,
        count: count
      });
    } catch (error) {
      console.error('Error deleting alerts by dossier:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },
   createDueDateReminders: async (req, res) => {
    try {
      const userRole = req.user?.role;
  
      if (userRole !== 'admin' && userRole !== 'directeur') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only administrators can trigger reminders'
        });
      }
      
      const created = await AlertService.createDueDateReminders();
      
      res.status(200).json({
        success: true,
        message: `${created} due date reminder alerts created`,
        count: created
      });
    } catch (error) {
      console.error('Error creating due date reminders:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};
