'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  FolderKanban, 
  Users, 
  CheckSquare, 
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity
} from 'lucide-react'

interface Statistics {
  totalDossiers: number
  totalUsers: number
  completionRate: number
  activeDossiers: number
  overdueDossiers: number
  tasksCompleted: number
  tasksInProgress: number
  tasksNotStarted: number
  monthlyTrend: Array<{
    month: string
    count: number
  }>
  departmentStats: Array<{
    name: string
    dossierCount: number
    completionRate: number
  }>
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
      const fetchStatistics = async () => {
        try {
          setLoading(true)
          const data = await getStatistics()
          setStats(data)
        } catch (err) {
          setError('Failed to load statistics')
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
    fetchStatistics()
  }, [])


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error || 'Failed to load statistics'}
      </div>
    )
  }

  const summaryCards = [
    {
      title: 'Total Dossiers',
      value: stats.totalDossiers,
      icon: FolderKanban,
      color: 'blue',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'purple',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: CheckSquare,
      color: 'green',
      trend: '+3%',
      trendUp: true
    },
    {
      title: 'Active Dossiers',
      value: stats.activeDossiers,
      icon: Activity,
      color: 'orange',
      trend: '-2%',
      trendUp: false
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600 text-sm mt-1">
          Overview of platform metrics and performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {card.trendUp ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      card.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.trend}
                    </span>
                    <span className="text-xs text-gray-400">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 bg-${card.color}-50 rounded-lg`}>
                  <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-gray-900">
                    {stats.tasksCompleted}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ 
                      width: `${(stats.tasksCompleted / (stats.tasksCompleted + stats.tasksInProgress + stats.tasksNotStarted)) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium text-gray-900">
                    {stats.tasksInProgress}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ 
                      width: `${(stats.tasksInProgress / (stats.tasksCompleted + stats.tasksInProgress + stats.tasksNotStarted)) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Not Started</span>
                  <span className="font-medium text-gray-900">
                    {stats.tasksNotStarted}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-400 rounded-full transition-all"
                    style={{ 
                      width: `${(stats.tasksNotStarted / (stats.tasksCompleted + stats.tasksInProgress + stats.tasksNotStarted)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.departmentStats.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary font-medium text-sm">
                      {dept.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{dept.name}</p>
                      <p className="text-xs text-gray-500">{dept.dossierCount} dossiers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-sm">
                      {dept.completionRate}%
                    </p>
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${dept.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Monthly Dossier Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-40 gap-2 px-2">
            {stats.monthlyTrend.map((item, index) => {
              const maxCount = Math.max(...stats.monthlyTrend.map(i => i.count))
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full relative">
                    <div 
                      className="w-full bg-primary/20 group-hover:bg-primary rounded-t-sm transition-all duration-500"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.count} dossiers
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {item.month}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}