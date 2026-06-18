'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AlertTriangle, CheckCircle, Clock, FileText, X } from 'lucide-react'
import { getAllAlerts} from '@/lib/api'

interface Alert {
  id: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  dossier: string
  lu: boolean
  createdAt: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [alertCount, setAlertCount] = useState<number>(0)

  useEffect(() => {
      const fetchAlerts = async () => {
        try {
          setLoading(true)
          const data = await getAllAlerts()
          console.log(data)
          setAlerts(data.data.alerts)
          setAlertCount(data.data.count)
        } catch (err) {
          setError('Failed to load alerts')
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
    fetchAlerts()
  }, [])


  const getSeverityColor = (severity: Alert['severity']) => {
    const colors = {
      LOW: 'bg-blue-100 text-blue-800 border-blue-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      CRITICAL: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[severity]
  }

  const getSeverityIcon = (severity: Alert['severity']) => {
    const icons = {
      LOW: <AlertTriangle className="w-4 h-4" />,
      MEDIUM: <AlertTriangle className="w-4 h-4" />,
      HIGH: <AlertTriangle className="w-4 h-4" />,
      CRITICAL: <AlertTriangle className="w-4 h-4" />
    }
    return icons[severity]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
        <p className="text-gray-600 text-sm mt-1">
          Monitor system alerts and notifications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unresolved</p>
                <p className="text-2xl font-bold text-orange-600">10</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-green-600">20</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No alerts to display</p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card 
              key={alert.id}
              className='border-l-4 border-yellow-400'
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${getSeverityColor('MEDIUM')}`}>
                      {getSeverityIcon('MEDIUM')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-gray-900">{alert.id}</h4>
                        <Badge className={getSeverityColor('MEDIUM')}>
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {alert.dossier}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}