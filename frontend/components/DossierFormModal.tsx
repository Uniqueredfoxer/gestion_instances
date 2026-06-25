'use client'

import { useState, useEffect, SubmitEventHandler } from 'react'
import { X, FolderKanban, User2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { User, Dossier } from '@/types'
import { createDossier, updateDossier } from '@/lib/api'

interface DossierFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (dossier: Dossier) => void
  dossierToEdit?: Dossier | null
  user: User | null | undefined
  users: Array<User> | undefined
}

export default function DossierFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  dossierToEdit = null,
  user,
  users = []
}: DossierFormModalProps) {
  const [formData, setFormData] = useState<Dossier>({
    titre: '',
    description: '',
    date_limite: '',
    statut: 'en_cours',
    id_responsable: 0 
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      id_responsable: user?.id || 0, // 💡 Initialise directement avec l'ID de l'utilisateur connecté
      statut: 'en_cours',
      date_limite: '',
    })
    setErrors({})
    setSuccessMessage('')
  }

  useEffect(() => {
    if (!isOpen) return;

    if (dossierToEdit) {
      setFormData({
        id: dossierToEdit.id,
        titre: dossierToEdit.titre || '',
        description: dossierToEdit.description || '',
        id_responsable: dossierToEdit.id_responsable || user?.id || 0,
        statut: dossierToEdit.statut,
        date_limite: dossierToEdit.date_limite ? dossierToEdit.date_limite.split('T')[0] : ''
      })
    } else {
      resetForm()
    }
  }, [dossierToEdit, isOpen, user])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis'
    } else if (formData.titre.length < 3) {
      newErrors.titre = 'Le titre doit contenir au moins 3 caractères'
    }

    // 💡 On valide en prenant en compte la valeur par défaut si l'état est à 0
    const currentResponsable = formData.id_responsable || user?.id || 0
    if (!currentResponsable || currentResponsable === 0) {
      newErrors.id_responsable = 'Veuillez sélectionner un responsable'
    }

    if (!formData.date_limite) {
      newErrors.date_limite = "La date d'échéance est requise"
    } else {
      const targetDate = new Date(formData.date_limite)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (targetDate < today) {
        newErrors.date_limite = "La date d'échéance doit être aujourd'hui ou ultérieure"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit: SubmitEventHandler = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setSuccessMessage('')
    setErrors({})

    try {
      const finalPayload = {
        ...formData,
        id_responsable: formData.id_responsable || user?.id || 0
      }
      console.log('Submitting payload: ', finalPayload)

      // 💡 Correction : finalPayload est maintenant transmis aux DEUX fonctions de l'API
      const response = dossierToEdit 
        ? await updateDossier(dossierToEdit.id!, finalPayload) 
        : await createDossier(finalPayload)
        
      const data = response.data

      if (!response.success) {
        throw new Error(response.error || 'une erreur est survenue')
      }

      setSuccessMessage(dossierToEdit ? 'Dossier modifié avec succès !' : 'Dossier créé avec succès !')
      onSuccess(data)
      
      setTimeout(() => {
        resetForm()
        onClose()
      }, 1500)

    } catch (err: any) {
      console.error('Error saving dossier:', err)
      setErrors({ submit: err.message || 'Une erreur est survenue' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'id_responsable') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" />
            {dossierToEdit ? 'Modifier le dossier' : 'Créer un nouveau dossier'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" disabled={loading}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{errors.submit}</span>
            </div>
          )}

          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1.5">
              Titre du dossier <span className="text-red-500">*</span>
            </label>
            <input
              id="titre"
              name="titre"
              type="text"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex: Projet de migration cloud"
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                errors.titre ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
              disabled={loading}
            />
            {errors.titre && <p className="mt-1 text-sm text-red-500">{errors.titre}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Décrivez le contenu du dossier..."
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="id_responsable" className="block text-sm font-medium text-gray-700 mb-1.5">
                Responsable <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  id="id_responsable"
                  name="id_responsable"
                  value={formData.id_responsable || user?.id || ''}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                    errors.id_responsable ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                  disabled={loading}
                >
                  <option value={user?.id}>Moi-meme</option>
                  {users.filter(u => u.id !== user?.id && u.role_dir !== 'admin').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nom} {u.prenom}
                    </option>
                  ))}
                </select>
              </div>
              {errors.id_responsable && <p className="mt-1 text-sm text-red-500">{errors.id_responsable}</p>}
            </div>

            <div>
              <label htmlFor="date_limite" className="block text-sm font-medium text-gray-700 mb-1.5">
                Date d&apos;échéance <span className="text-red-500">*</span>
              </label>
              <input
                id="date_limite"
                name="date_limite"
                type="date"
                value={formData.date_limite || ''}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                  errors.date_limite ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                disabled={loading}
              />
              {errors.date_limite && <p className="mt-1 text-sm text-red-500">{errors.date_limite}</p>}
            </div>
          </div>

          {dossierToEdit && (
            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
              <select
                id="statut"
                name="statut"
                value={formData.statut || 'en_cours'}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                disabled={loading}
              >
                <option value="en_cours">En cours</option>
                <option value="boucle">Bouclé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
          )}
          
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                  {dossierToEdit ? 'Modification...' : 'Création...'}
                </>
              ) : (
                dossierToEdit ? 'Modifier le dossier' : 'Créer le dossier'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}