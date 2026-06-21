'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CheckSquare, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileText,
  Award,
  Loader2,
  ArrowRight,
  Clipboard
} from 'lucide-react'
import { getMyStats, getMyTasks } from '@/lib/api'
import { Tache } from '@/types'
interface DashboardStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  urgentTasks: number
  completionRate: number
  onTimeRate: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [tasks, setTasks] = useState<Tache[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      const [myStats, tasks] = await Promise.all([
        getMyStats(user.id),
        getMyTasks(),
      ])

      setStats(myStats.data)
      setTasks(tasks.data)

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Une erreur est survenue lors du chargement du tableau de bord')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchDashboardData()
  }, [])


  const getStatusBadge = (status: string) => {
    const badges = {
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'en_cours': 'bg-blue-100 text-blue-800',
      'terminee': 'bg-green-100 text-green-800',
      'urgente': 'bg-red-100 text-red-800'
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'termine': 'Terminé',
      'urgente': 'Urgente'
    }
    return labels[status as keyof typeof labels] || status
  }


  const getActivityIcon = (type: string) => {
    const icons = {
      'task': <CheckCircle className="w-4 h-4 text-green-500" />,
      'dossier': <FileText className="w-4 h-4 text-blue-500" />,
      'comment': <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
    return icons[type as keyof typeof icons] || <AlertCircle className="w-4 h-4 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-gray-500 text-sm">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-3"
            onClick={fetchDashboardData}
          >
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  const urgentTasks = tasks.filter(task => {
    if (task.statut === 'termine' || task.statut === 'annule') return false
    const dueDate = new Date(task.date_fin)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mon Tableau de Bord
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Bonjour {user?.prenom}! Voici un aperçu de vos tâches
          </p>
        </div>

      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tâches assignées</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.totalTasks || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <CheckSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Taux d&apos;achèvement</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats?.completionRate || 0}%
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En cours</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {stats?.inProgressTasks || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tâches urgentes</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {urgentTasks.length}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mes Tâches</CardTitle>
              <Button variant="link" className="text-sm">
                Voir toutes
                <ArrowRight className='w-4 h-4 ml-2'/>
              </Button>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune tâche ne vous a encore été assignée</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-125 overflow-y-auto pr-2">
                  {tasks.slice(0, 5).map((task) => {
                    const isUrgent = urgentTasks.some(t => t.id === task.id)
                    return (
                      <div 
                        key={task.id} 
                        className={`p-4 rounded-lg border ${
                          isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-medium text-gray-900 ${
                                task.statut === 'termine' ? 'line-through text-gray-400' : ''
                              }`}>
                                {task.libelle}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(task.statut)}`}>
                                {getStatusLabel(task.statut)}
                              </span>
                              {isUrgent && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Urgent
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                Échéance: {new Date(task.date_fin).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {task.statut !== 'termine' ? (
                              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Terminer
                              </Button>
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>


        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              {0 === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucune activité récente
                </p>
              ) : (
                <div className="space-y-3">
                  
                </div>
              )}
            </CardContent>
          </Card>


          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Taux ponctualité</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {stats?.onTimeRate || 0}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Tâches terminées</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats?.completedTasks || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Urgent Tasks Alert */}
          {urgentTasks.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700">
                      Tâches urgentes
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Vous avez {urgentTasks.length} tâche{urgentTasks.length > 1 ? 's' : ''} à échéance proche
                    </p>
                    <Button 
                      variant="link" 
                      className="text-xs text-red-600 hover:text-red-700 p-0 h-auto mt-1"
                    >
                      Voir les détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievement */}
          {stats && stats.completionRate >= 80 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      Excellent travail!
                    </p>
                    <p className="text-xs text-green-600">
                      Vous avez un taux d&apos;achèvement de {stats.completionRate}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}