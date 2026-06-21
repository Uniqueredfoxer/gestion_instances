'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { deleteDossier, getAllDossiers, getTasks } from '@/lib/api'
import DossierFormModal from '@/components/DossierFormModal'
import TacheFormModal from '@/components/TacheFormModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type { Dossier, User, Tache } from '@/types'
import { useAuth } from '@/app/hooks/useAuth'
import { getAllUsers } from '@/lib/api'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
} from 'lucide-react';



export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState<{type: 'create' | 'edit' | null, dossier?: Dossier | null, user?: | User | null }>({type: null})
  const [editSuccess, setEditSuccess] = useState('')
  const [expandedDossierId, setExpandedDossierId] = useState<number | null>(null);
  const [dossierTasks, setDossierTasks] = useState<Record<number, Tache[]>>({});
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isTacheModalOpen, setIsTacheModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const {user} = useAuth()
  const fetchDossiers = async () => {
    try {
      setLoading(true)
      const data = await getAllDossiers()
      setDossiers(data.data)
    } catch (err) {
      toast.error('Impossible de charger les dossiers')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(data.data)
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchDossiers();
    fetchUsers()
  }, [])

  const openCreate = () => {
      setModal({type: 'create', dossier: null, user: user})
    }
    const openEdit = (dossier: Dossier)=>{
      setModal({type: 'edit', dossier: dossier})
    }
    const closeModal = () => {
    setModal({ type: null });
    };


  const handleView = async (id: number) => {
    if (expandedDossierId === id) {
      setExpandedDossierId(null);
      return;
    }
    setExpandedDossierId(id);
    if (!dossierTasks[id]) {
      try {
        setIsTasksLoading(true);
        const data = await getTasks(id);
        setDossierTasks(prev => ({ ...prev, [id]: data.data || [] }));
      } catch (err) {
        console.error("Failed to load tasks", err);
      } finally {
        setIsTasksLoading(false);
      }
    }
  }
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      await deleteDossier(deleteTarget)
      setDossiers(dossiers.filter(d => d.id !== deleteTarget))
      toast.success('Dossier supprimé avec succès')
    } catch (err) {
      toast.error('Impossible de supprimer le dossier')
      console.error(err)
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const getStatusColor = (statut: Dossier['statut']) => {
    const colors = {
      en_cours: 'bg-blue-100 text-blue-800',
      boucle: 'bg-green-100 text-green-800',
      en_retard: 'bg-red-100 text-red-800'
    }
    return colors[statut as keyof typeof colors] || colors['en_cours']
  }

  const onSuccess=(dossier: Dossier)=> {
      if(modal.type === 'create'){
        setDossiers([...dossiers, dossier])
        fetchDossiers()
        toast.success('Dossier créé avec succès')
      }else if(modal.type === 'edit'){
        fetchDossiers()
        toast.success('Dossier modifié avec succès')
      }
  }
  const filteredDossiers = dossiers.filter(dossier => {
    const searchLower = search.toLowerCase()
    return (
      dossier.titre.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dossiers</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage all dossiers in the system
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Create New Dossier
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search dossiers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">Titre</th>
                  <th className="px-6 py-3">Créé par</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Responsable</th>
                  <th className="px-6 py-3 hidden sm:table-cell">Taches</th>
                  <th className="px-6 py-3 hidden md:table-cell">Progres</th>
                  <th className="px-6 py-3 hidden xl:table-cell">Date Limite</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDossiers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No dossiers found
                    </td>
                  </tr>
                ) : (
                  filteredDossiers.map((dossier) => (
                    <React.Fragment key={dossier.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {dossier.titre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {dossier.cree_par || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span>
                            {dossier.responsable?.split(' ')[0]} {dossier.responsable?.split(' ')[1]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{dossier.taches_terminees}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-600">{dossier.total_tache}</span>
                        </div>
                      </td>
                      {(()=>{
                        const total = dossier.total_tache || 0;
                        const finished = dossier.taches_terminees || 0;
                        const percentage = total > 0 ? (finished / total) * 100 : 0;

                      return(
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-600  transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </td>);
                    })()}
                      <td className="px-6 py-4 text-gray-600 text-xs hidden xl:table-cell">
                        {new Date(dossier.date_limite).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dossier.statut)}`}>
                            {dossier.statut}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
                            title="View" onClick={() => handleView(dossier.id!)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
                            title="Edit" onClick={()=> openEdit(dossier)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 hover:bg-red-50 rounded transition-colors text-gray-500 hover:text-red-600"
                            title="Delete"
                            onClick={() => setDeleteTarget(dossier.id!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedDossierId === dossier.id && (
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="text-left space-y-4">
                            {dossier.description && (
                              <div>
                                <h4 className="font-semibold text-gray-800 text-sm">Description</h4>
                                <p className="text-sm text-gray-600 mt-1">{dossier.description}</p>
                              </div>
                            )}
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-semibold text-gray-800 text-sm">Tâches ({dossierTasks[dossier.id!]?.length || 0})</h4>
                                <Button size="sm" onClick={() => setIsTacheModalOpen(true)} className="flex items-center gap-1">
                                  <Plus className="w-3 h-3" /> Ajouter une tâche
                                </Button>
                              </div>
                              {isTasksLoading && !dossierTasks[dossier.id!] ? (
                                <div className="text-sm text-gray-500">Chargement des tâches...</div>
                              ) : dossierTasks[dossier.id!]?.length === 0 ? (
                                <div className="text-sm text-gray-500">Aucune tâche pour ce dossier.</div>
                              ) : (
                                <ul className="space-y-2">
                                  {dossierTasks[dossier.id!]?.map((tache) => (
                                    <li key={tache.id} className="text-sm bg-white border border-gray-200 rounded p-3 flex justify-between items-center">
                                      <div>
                                        <div className="font-medium text-gray-800">{tache.libelle}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex gap-3">
                                          <span>Échéance: {tache.date_fin ? new Date(tache.date_fin).toLocaleDateString() : 'N/A'}</span>
                                          <span className="capitalize border-l pl-3 border-gray-300">Statut: {tache.statut.replace('_', ' ')}</span>
                                          <span className="border-l pl-3 border-gray-300">Avancement: {tache.avancement}%</span>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
          <DossierFormModal
            isOpen={modal.type !== null}
            onClose={closeModal}
            onSuccess={onSuccess}
            dossierToEdit={modal.dossier ?? null}
            user={modal.user? modal.user: null}
            users={users}
          />
          <TacheFormModal
            isOpen={isTacheModalOpen}
            onClose={() => setIsTacheModalOpen(false)}
            onSuccess={() => {
              if (expandedDossierId) {
                getTasks(expandedDossierId).then(data => {
                  setDossierTasks(prev => ({ ...prev, [expandedDossierId]: data.data || [] }));
                });
              }
            }}
            dossierId={expandedDossierId}
            users={users}
            user={user}
          />
          <ConfirmModal
            isOpen={deleteTarget !== null}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            isLoading={isDeleting}
            title="Supprimer le dossier"
            description="Cette action est irréversible. Le dossier et toutes ses données associées seront définitivement supprimés."
          />
    </div>
  )
}