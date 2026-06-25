'use client'

import { useState, useEffect, SubmitEventHandler } from 'react'
import { X, CheckCircle, AlertCircle, User2, AlignLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { updateTask } from '@/lib/api'
import { Tache, User } from '@/types'

interface TacheEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tacheToEdit: Tache
  dossierId: number | null
  users: User[]
  user: User | null
}

export default function TacheEditModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  tacheToEdit,
  dossierId,
  users,
  user
}: TacheEditModalProps) {
  const [formData, setFormData] = useState<{libelle: string, date_fin: string, id_responsable: number}>({
    libelle: tacheToEdit.libelle,
    date_fin: tacheToEdit.date_fin?.split('T')[0],
    id_responsable: tacheToEdit.id_responsable 
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [filteredUser, setFilteredUsers] = useState<User[]>([])


  const resetForm = () => {
    setFormData({
      libelle: '',
      date_fin: '',
      id_responsable: 0
    })
    setErrors({})
    setSuccessMessage('')
  }

  useEffect(() => {
    setFilteredUsers(users.filter(u=> u.id !==user?.id && u.role_dir !== 'admin'))

    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.libelle.trim()) {
      newErrors.libelle = 'Le libellé est requis'
    }

    if (!formData.id_responsable || formData.id_responsable === 0) {
      newErrors.id_responsable = 'Veuillez sélectionner un intervenant'
    }

    
    if (!formData.date_fin) {
      newErrors.date_fin = "La date de fin est requise"
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
      const payload = {
        libelle: formData.libelle,
        date_fin: formData.date_fin,
        id_responsable: formData.id_responsable      }
      console.log('📦 Payload envoyé:', payload)
  console.log('🔍 Clés du payload:', Object.keys(payload))
      const response = await updateTask(tacheToEdit.id, payload)

      if (!response.success) {
        throw new Error(response.error || 'Une erreur est survenue lors de la création de la tâche')
      }

      setSuccessMessage('Tâche modifié avec succès !')
      
      onSuccess()
      
      setTimeout(() => {
        resetForm()
        onClose()
      }, 1500)

    } catch (err: any) {
      console.error('Error saving task:', err)
      setErrors({ submit: err.message || 'Une erreur est survenue' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlignLeft className="w-5 h-5 text-primary" />
            Modifier une tâche
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
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
            <label htmlFor="libelle" className="block text-sm font-medium text-gray-700 mb-1.5">
              Libellé <span className="text-red-500">*</span>
            </label>
            <input
              id="libelle"
              name="libelle"
              type="text"
              value={formData.libelle}
              onChange={handleChange}
              placeholder="Ex: Rédaction du rapport initial"
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                errors.libelle ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
              disabled={loading}
            />
            {errors.libelle && (
              <p className="mt-1 text-sm text-red-500">{errors.libelle}</p>
            )}
          </div>

          <div>
            <label htmlFor="id_responsable" className="block text-sm font-medium text-gray-700 mb-1.5">
              Intervenant <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="id_responsable"
                name="id_responsable"
                value={formData.id_responsable}
                onChange={handleChange}
                className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                  errors.id_responsable ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                disabled={loading}
              >
                <option value={user?.id}>Moi-même</option>
                {filteredUser.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nom} {u.prenom}
                  </option>
                ))}
              </select>
            </div>
            {errors.id_responsable && (
              <p className="mt-1 text-sm text-red-500">{errors.id_responsable}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700 mb-1.5">
                Date de fin prévue <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="date_fin"
                  name="date_fin"
                  type="date"
                  value={formData.date_fin}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                    errors.date_fin ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                  disabled={loading}
                />

              </div>
              {errors.date_fin && (
                <p className="mt-1 text-sm text-red-500">{errors.date_fin}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                  Modification...
                </>
              ) : (
                'Modifier'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
