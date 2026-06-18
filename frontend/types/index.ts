// app/types/index.ts
export type UserRole = 'admin' | 'directeur' | 'manager' | 'intervenant';

export interface User {
  id: string
  nom: string
  prenom: string
  email: string
  role_dir: 'admin' | 'directeur' | 'intervenant'
  statut?: 'actif' | 'inactif'
  poste: string
  date_creation?: string
}

export interface Dossier {
  id: number;
  titre: string;
  description: string;
  date_creation: string;
  date_limite: string;
  date_fin_reelle?: string;
  statut: 'en_cours' | 'boucle';
  cree_par: number;
  id_instance?: number;
  cree_par_nom?: string;
  instance_nom?: string;
  total_taches?: number;
  taux_achevement?: number;
}

export interface Tache {
  id: number;
  libelle: string;
  date_creation: string;
  date_debut?: string;
  date_fin_prevue?: string;
  avancement: number;
  statut: 'a_faire' | 'en_cours' | 'termine';
  id_dossier: number;
  id_intervenant: number;
  dossier_titre?: string;
  role_intervention?: string;
  statut_validation?: 'active' | 'en_attente_validation' | 'validee';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}