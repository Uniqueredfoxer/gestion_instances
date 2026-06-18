'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { StatCard } from '@/components/ui/statCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getStats } from '@/lib/api'
import { 
  FolderKanban, 
  Users, 
  CheckSquare, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCheck,
  ClockAlert,
} from 'lucide-react'


export default function OverviewPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await getStats()
        console.log(response.data)
        const data = response.data
        setStats(data)
      } catch (err) {
        setError('Failed to load dashboard statistics')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])


  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bonjour'
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
      value: stats?.totaldossiers || 0,
      icon: FolderKanban,
      color: 'primary'
    },
    {
      title: 'Total Users',
      value: stats?.totalusers || 0,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Taux de MEO global',
      value: `${stats?.taux_completion || 0}%`,
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Dossier terminés',
      value: stats?.dossier_termines || 0,
      icon: CheckCheck,
      color: 'orange'
    },
    {
      title: 'Dossier en Retard',
      value: stats?.dossier_en_retard,
      icon: ClockAlert
    }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()} {user?.prenom},
        </h1>
        <p className="text-gray-600 mt-1">
          Bienvenue sur votre espace DirectTrack.
        </p>lastName
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <StatCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
          />
        ))}
      </div>

      {/* Recent Activity / Additional Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activites Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">
                No recent activity to display.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm">
              Create New Dossier
            </button>
            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm">
              Add New User
            </button>
            <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm">
              View Reports
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}