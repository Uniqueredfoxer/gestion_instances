'use client'

import { getUserAlerts } from '@/lib/api'
import { useEffect, useState } from 'react'
import type { Alert } from '@/types'
import { 
  Bell, 
  RefreshCw,
  Inbox,
  CheckCheck
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

type AlertStatus = 'Unresolved' | 'In Progress' | 'Resolved'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const result = await getUserAlerts()
      setAlerts(result.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await fetchAlerts()
  }

  const handleResolve = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id 
        ? { ...alert, resolved: true }
        : alert
    ))
  }

  const handleMarkAllResolved = () => {
    setAlerts(alerts.map(alert => ({ ...alert, resolved: true })))
  }

  const unresolvedCount = alerts.filter(a => !a.resolved && !a.inProgress).length
  const filteredAlerts = alerts

  const getStatusColor = (status: AlertStatus) => {
    const colors = {
      'Unresolved': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'In Progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Resolved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    }
    return colors[status] || colors['Unresolved']
  }

  const getStatusLabel = (status: AlertStatus) => {
    const labels = {
      'Unresolved': 'Non résolu',
      'In Progress': 'En cours',
      'Resolved': 'Résolu'
    }
    return labels[status] || status
  }

  const formatTime = (date?: string) => {
    if (!date) return 'Date inconnue'
    const now = new Date()
    const alertDate = new Date(date)
    const diffHours = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'À l\'instant'
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffHours < 48) return 'Hier'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Rafraîchir
          </Button>
          {unresolvedCount > 0 && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleMarkAllResolved}
              className="flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Tout résoudre
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-500">Chargement des alertes...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-10 h-10  text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Vous n'avez reçu aucune alerte pour le moment
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Les alertes apparaîtront ici lorsqu'elles seront disponibles
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const status: AlertStatus = 'In Progress'

            return (
              <Card key={alert.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap",
                            getStatusColor(status)
                          )}>
                            {getStatusLabel(status)}
                          </span>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}