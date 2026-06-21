'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { StatCard } from '@/components/ui/statCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getStats, getAllUsers } from '@/lib/api'
import UserFormModal from '@/components/UserFormModal'
import DossierFormModal from '@/components/DossierFormModal'
import { 
  FolderKanban, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCheck,
  ClockAlert,
} from 'lucide-react'
import { User } from '@/types'

interface stats {
  total_dossiers: number
  total_users: number,
  completion_rate: number,
  dossiers_termines: number,
  dossier_en_retard: number
}

export default function OverviewPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>()
  const [stats, setStats] = useState<stats|null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isDossierModalOpen, setIsDosierModalOpen] = useState(false)
  
  const getUsers = async ()=>{ 
    const response = await getAllUsers()
    const users = response.data
    console.log(users)
    return users
  }
  useEffect(() => {
    const fetchStatsAndUsers = async () => {
      try {
        setLoading(true)
        const stats = await getStats()
        const usersData = await getUsers() 
        setStats(stats.data)
        setUsers(usersData)
      } catch (err) {
        setError('Failed to load dashboard statistics')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStatsAndUsers()
  }, [])

  const openUserModal = ()=> setIsUserModalOpen(true);
  const openDossierModal = ()=> setIsDosierModalOpen(true)
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 15) return 'Bonjour'
    return 'Bonsoir'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    )
  }

  const kpis = [
    {
      title: 'Total Dossiers',
      value: stats?.total_dossiers || 0,
      icon: FolderKanban,
      color: 'primary'
    },
    {
      title: 'Total Utilisateur',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'secondary'
    },
    {
      title: 'Taux de MEO global',
      value: `${stats.total_dossiers > 0? (stats.dossiers_termines/stats.total_dossiers)*100: 0}%`,
      icon: TrendingUp,
      color: 'success'
    },
    {
      title: 'Dossier traités',
      value: stats?.dossiers_termines || 0,
      icon: CheckCheck,
      color: 'success'
    },
    {
      title: 'Dossier en Retard',
      value: stats?.dossier_en_retard || 0,
      icon: ClockAlert,
      color: 'error'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()} {user?.prenom},
        </h1>
        <p className="text-gray-600 mt-1">
          Bienvenue dans votre espace.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-900">
        {kpis.map((kpi, index) => (
          <StatCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
          />
        ))}
      </div>

      {/*  Activites Recentes*/}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 text-gray-200 bg-card">
          <CardHeader>
            <CardTitle className='text-gray-900'>Activites Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                Aucune activite recente a afficher.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <AlertCircle className="w-5 h-5" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <button className="w-full text-left px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors text-sm" onClick={openDossierModal}>
              Ajouter un Dossier
            </button>
            <button className="w-full text-left px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors text-sm" onClick={openUserModal}>
              Ajouter un Utilisateur
            </button>
            <button className="w-full text-left px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors text-sm">
              Voir les rapports
            </button>
          </CardContent>
        </Card>
      </div>
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={()=> setIsUserModalOpen(false)}
        onSuccess={()=>{}}
      />
      <DossierFormModal
        isOpen={isDossierModalOpen}
        onClose={()=> setIsDosierModalOpen(false)}
        onSuccess={()=> {}}
        user={user}
        users={users}
      />
    </div>
  )
}