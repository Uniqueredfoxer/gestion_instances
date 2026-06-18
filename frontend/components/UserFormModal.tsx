'use client';
import { useState, useEffect, SubmitEventHandler, ChangeEventHandler } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { register } from '@/lib/api'
import type { User } from '@/types'
import { 
  
  X,
  User2,
  Mail,
  Briefcase,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react'


export default function UserFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  userToEdit = null 
}: { 
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: User) => void //add the new user immediately to the list
  userToEdit?: User | null
}) {
  const [formData, setFormData] = useState({
    nom: userToEdit?.nom || '',
    prenom: userToEdit?.prenom || '',
    email: userToEdit?.email || '',
    poste: userToEdit?.poste || '',
    mdp: '',
  });
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState< Record<string, string > >({})
  const [successMessage, setSuccessMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      poste: '',
      mdp: ''
    })
    setErrors({})
    setSuccessMessage('')
  }
  


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis'
    } else if (formData.nom.length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères'
    }
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis'
    } else if (formData.prenom.length < 2) {
      newErrors.prenom = 'Le prénom doit contenir au moins 2 caractères'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide'
    }

    if(!formData.mdp.trim()){
        newErrors.mdp = "le mot de passe est requis"
    }else if(!/[A-Z]/.test(formData.mdp) || !/[a-z]/.test(formData.mdp) || !/[0-9]/.test(formData.mdp)){
        newErrors.mdp = 'le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
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
      const response = await register(formData)

      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de la création')
      }

      setSuccessMessage('Utilisateur créé avec succès !')
      onSuccess(response.data)
      
      setTimeout(() => {
        resetForm()
        onClose()
      }, 1500)

    } catch (err: unknown) {
      console.error('Error creating user:', err)
      setErrors({ submit: 'Une erreur est survenue' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  const handlePasswordInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>{
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if(value.length<8){
        setPasswordError('le mot de passe doit contenir au moins 8 caractères')
    }else if(!/[A-Z]/.test(formData.mdp) || !/[a-z]/.test(formData.mdp) || !/[0-9]/.test(formData.mdp)){
        setPasswordError('le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
    }else{
        setPasswordError('')
    }
    
  }
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">
            Ajouter un utilisateur
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
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleChange}
                placeholder="OUATTARA"
                className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                  errors.nom ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                disabled={loading}
              />
            </div>
            {errors.nom && (
              <p className="mt-1 text-sm text-red-500">{errors.nom}</p>
            )}
          </div>
          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1.5">
              Prénom <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="prenom"
                name="prenom"
                type="text"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="ex: Awa"
                className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                  errors.prenom ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                disabled={loading}
              />
            </div>
            {errors.prenom && (
              <p className="mt-1 text-sm text-red-500">{errors.prenom}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="OAwa@gmail.com"
                className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="mdp" className="block text-sm font-medium text-gray-700 mb-1.5">
              Mot De Passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="mdp"
                name="mdp"
                type="password"
                value={formData.mdp}
                onChange={handlePasswordInputChange}
                placeholder="********"
                className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                  passwordError ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                disabled={loading}
              />
            </div>
            {passwordError && (
              <p className="mt-1 text-sm text-red-500">{passwordError}</p>
            )}
          </div>

          <div>
            <label htmlFor="poste" className="block text-sm font-medium text-gray-700 mb-1.5">
              Poste
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="poste"
                name="poste"
                type="text"
                value={formData.poste || ''}
                onChange={handleChange}
                placeholder="Secretaire"
                className="w-full pl-9 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                disabled={loading}
              />
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
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Création...
                </>
              ) : (
                'Créer'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}