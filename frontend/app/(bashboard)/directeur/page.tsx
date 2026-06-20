'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { StatCard } from '@/components/ui/statCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getStats } from '@/lib/api'
import { 
  FolderKanban, 
  CheckCheck,
  Users
} from 'lucide-react'

interface StatsData {
  total_dossiers: number
  dossiers_termines: number
  dossiers_par_responsable: Array<{ nom: string, prenom: string, count: string }>
  nbre_taches_par_intervenant: Array<{ nom: string, prenom: string, count: string }>
}

export default function DirecteurOverviewPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const statsData = await getStats()
        setStats(statsData.data)
      } catch (err) {
        setError('Échec du chargement des statistiques')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

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
      title: 'Dossiers Traités à Temps',
      value: stats?.dossiers_termines_a_temps || 0,
      icon: CheckCheck,
      color: 'success'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()} {user?.prenom},
        </h1>
        <p className="text-gray-600 mt-1">
          Bienvenue dans votre espace directeur. Voici l'état d'avancement des dossiers.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-900">
        {kpis.map((kpi, index) => (
          <StatCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color as any}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="text-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              Dossiers par Responsable
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.dossiers_par_responsable && stats.dossiers_par_responsable.length > 0 ? (
              <ul className="space-y-4">
                {stats.dossiers_par_responsable.map((resp, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="font-medium text-gray-700">{resp.prenom} {resp.nom}</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                      {resp.count} dossier(s)
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6 border border-dashed border-gray-200 rounded-lg">
                Aucune donnée à afficher.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="text-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              Tâches par Intervenant
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.nbre_taches_par_intervenant && stats.nbre_taches_par_intervenant.length > 0 ? (
              <ul className="space-y-4">
                {stats.nbre_taches_par_intervenant.map((resp, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="font-medium text-gray-700">{resp.prenom} {resp.nom}</span>
                    <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-semibold">
                      {resp.count} tâche(s)
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6 border border-dashed border-gray-200 rounded-lg">
                Aucune donnée à afficher.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}