
import type { Tache } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';


const getHeaders = (isFormData = false) => {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('token');
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};


async function request(
  endpoint: string,
  options: RequestInit = {}
){
  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();
  
  if (!response.ok || (data.success === false)) {
    throw new Error(data.error || 'Une erreur est survenue');
  }
  
  return data;
}


export const getStats = ()=> request('/dossiers/stats', {headers: getHeaders()})
export const getMyStats = (id: number)=> request(`/dossiers/stats/${id}`,{headers: getHeaders()})

export const login = (email: string, mdp: string)=>
  request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, mdp }),
    })
  
export const register= (userData: unknown) =>
  request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
  })


export const  getAllUsers= () =>
    request('/users', {
      headers: getHeaders(),
    })
  
export const  getUserById = (id: number) =>
    request(`/users/${id}`, {
      headers: getHeaders(),
    })
  
export const  createUser =(data: unknown) =>
    request('/users/create', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
  
export const  updateUser =(id: number, data: unknown) =>
    request(`/users/update/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
  
export const  deleteUser = (id: number) =>
    request(`/users/delete/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
  
export const  getUserPerformance = () =>
    request('/users/performance', {
      headers: getHeaders(),
    })



export const  getAllDossiers = (params?: URLSearchParams) =>
    request(`/dossiers${params ? `?${params}` : ''}`, {
      headers: getHeaders(),
    })
  
export const  getDossierById= (id: number) =>
    request(`/dossiers/${id}`, {
      headers: getHeaders(),
    })
  
export const  createDossier = (data: unknown) =>
    request('/dossiers/create', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
  
export const  updateDossier = (id: number, data: unknown) =>
    request(`/dossiers/update/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
  
export const  deleteDossier = (id: number) =>
    request(`/dossiers/delete/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
  
export const  getStatistics = () =>
    request('/dossiers/stats', {
      headers: getHeaders(),
    })
  
  
export const  createTask = (dossierId: number, data: unknown) =>
    request(`/dossiers/${dossierId}/taches/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
  
export const  getTasks = (dossierId: number) =>
    request(`/dossiers/${dossierId}/taches`, {
      headers: getHeaders(),
    })
  
export const  updateTask = (taskId: number, data: unknown) =>
    request(`/dossiers/taches/update/${taskId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })

export const  validateTask = (taskId: number, data: { approuve: boolean; commentaires?: string }) =>
    request(`/dossiers/taches/validate/${taskId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })



export const  getMyTasks = () =>
    request('/dossiers/mes-taches', {
      headers: getHeaders(),
    })
  
export const  updateProgress = (taskId: number, avancement: number) =>
    request(`/dossiers/taches/avancement/${taskId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ avancement }),
    })
  
export const  requestCompletion = (taskId: number) =>
    request(`/dossiers/taches/demander-validation/${taskId}`, {
      method: 'POST',
      headers: getHeaders(),
    })
export const getUserAlerts = () => request('/alertes/mes-alertes', { headers: getHeaders() })
export const getAllAlerts = () => request('/alertes', { headers: getHeaders() })