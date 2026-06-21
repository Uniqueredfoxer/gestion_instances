export type UserRole = 'admin' | 'directeur' | 'manager' | 'intervenant';

export interface User {
  id?: number
  nom: string
  prenom: string
  email: string
  role_dir: 'admin' | 'directeur' | 'intervenant'
  statut?: 'actif' | 'inactif'
  poste: string
  date_creation?: string
}

export interface Dossier {
  id?: number
  titre: string
  description?: string
  statut: 'en_cours' | 'en_retard' | 'boucle' | 'annule'
  id_createur?: number
  cree_par?: string 
  id_responsable: number
  responsable?: string
  taches_terminees?: number
  total_tache?: number
  completedTasks?: number
  taux_achevement?: number
  date_creation?: string
  date_limite: string
}

export interface Tache {
  id: number;
  libelle: string;
  description: string,
  date_creation?: string;
  date_debut?: string;
  date_fin: string;
  avancement: number;
  statut: 'a_faire' | 'en_cours' | 'termine';
  id_dossier: number;
  id_intervenant: number;
  titre_dossier?: string;
  intervenant?: string;
  statut_validation?: 'active' | 'en_attente_validation' | 'validee';
}
export interface Alert {
  id?: number;
  message: string;
  titre_dossier?: string;
  libelle_tache?: string;
  nom_dest?: string;
  prenom_dest: string;
}
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}