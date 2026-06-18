'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { getDossierById, deleteDossier, getAllDossiers } from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Users as UsersIcon,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'


interface Dossier {
  id: string
  referenceNumber: string
  title: string
  status: 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  assignedManager: {
    id: string
    firstName: string
    lastName: string
  }
  taskCount: number
  completedTasks: number
  completionRate: number
  createdAt: string
  dueDate: string
}

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
      const fetchDossiers = async () => {
        try {
          setLoading(true)
          const data = await getAllDossiers()
          setDossiers(data.data)
        } catch (err) {
          setError('Failed to load dossiers')
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
    fetchDossiers()
  }, [])


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dossier?')) return
    try {
      await deleteDossier(id)
      setDossiers(dossiers.filter(d => d.id !== id))
    } catch (err) {
      alert('Failed to delete dossier')
      console.error(err)
    }
  }

  const getStatusColor = (status: Dossier['status']) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-blue-100 text-blue-800',
      ON_HOLD: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || colors.DRAFT
  }

  const getPriorityColor = (priority: Dossier['priority']) => {
    const colors = {
      LOW: 'bg-blue-100 text-blue-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800'
    }
    return colors[priority] || colors.MEDIUM
  }

  const filteredDossiers = dossiers.filter(dossier => {
    const searchLower = search.toLowerCase()
    return (
      dossier.title.toLowerCase().includes(searchLower) ||
      dossier.referenceNumber.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dossiers</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage all dossiers in the system
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Dossier
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search dossiers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Manager</th>
                  <th className="px-6 py-3 hidden sm:table-cell">Tasks</th>
                  <th className="px-6 py-3 hidden md:table-cell">Progress</th>
                  <th className="px-6 py-3 hidden xl:table-cell">Due Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDossiers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No dossiers found
                    </td>
                  </tr>
                ) : (
                  filteredDossiers.map((dossier) => (
                    <tr key={dossier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-primary">
                        {dossier.referenceNumber}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {dossier.title}
                      </td>
                      <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                            {dossier.assignedManager.firstName[0]}
                          </div>
                          <span>
                            {dossier.assignedManager.firstName} {dossier.assignedManager.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{dossier.completedTasks}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-600">{dossier.taskCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${dossier.completionRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {dossier.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs hidden xl:table-cell">
                        {new Date(dossier.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dossier.status)}`}>
                            {dossier.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(dossier.priority)}`}>
                            {dossier.priority}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 hover:bg-red-50 rounded transition-colors text-gray-500 hover:text-red-600"
                            title="Delete"
                            onClick={() => handleDelete(dossier.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}