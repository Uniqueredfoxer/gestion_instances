'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import type { User } from '@/types'
import UserFormModal from '@/components/UserFormModal'
import { 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  UserX,
  Search,
} from 'lucide-react'
import { getAllUsers, deleteUser } from '@/lib/api'




export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState<{type: 'create' | 'edit' | null; user?: User | null}>({type: null})

  useEffect(() => {
      const fetchUsers = async () => {
        try {
          setLoading(true)
          const data = await getAllUsers()
          console.log(data)
          setUsers(data.data)
        } catch (err) {
          setError('Failed to load users')
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
    fetchUsers()
  }, [])


  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await deleteUser(id)
      setUsers(users.filter(u => u.id !== id))
    } catch (err) {
      alert('Failed to delete user')
      console.error(err)
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = search.toLowerCase()
    return (
      user.prenom.toLowerCase().includes(searchLower) ||
      user.nom.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    )
  })

  const handleUserSuccess = (user: User) => {
    if (modal.type === 'edit') {
      setUsers(users.map(u => u.id === user.id ? user : u))
    } else {
      setUsers([...users, user])
    }
    closeModal()
  }

  const openCreate = () => {
    setModal({type: 'create', user: null})
  }
  const openEdit = (user: User)=>{
    setModal({type: 'edit', user: user})
  }
  const closeModal = () => {
  setModal({ type: null });
  };
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 text-sm mt-1">
            Gerer tous les utilisateurs du systeme
          </p>
        </div>
        <Button className="flex  items-center gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Creer un utilisateur
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{`${filteredUsers.length} ${filteredUsers.length > 1 ? 'utilisateurs' : 'utilisateur'}`}</span>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3 hidden md:table-cell">Email</th>
                  <th className="px-6 py-3 hidden lg:table-cell">Poste</th>
                  <th className="px-6 py-3 hidden md:table-cell">Rôle</th>
                  <th className="px-6 py-3 hidden sm:table-cell">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary font-medium text-sm">
                            {user.prenom[0]}{user.nom[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.prenom} {user.nom}
                            </p>
                            <p className="text-xs text-gray-500 md:hidden">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 hidden md:table-cell">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-gray-600 hidden lg:table-cell capitalize">
                        {user.poste?.toLowerCase().replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-gray-600 hidden md:table-cell capitalize">
                        {user.role_dir}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.statut === 'actif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.statut === 'actif' ? (
                            <UserCheck className="w-3 h-3 mr-1" />
                          ) : (
                            <UserX className="w-3 h-3 mr-1" />
                          )}
                          {user.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
                            title="Edit" onClick={()=> openEdit(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 hover:bg-red-50 rounded transition-colors text-gray-500 hover:text-red-600"
                            title="Delete"
                            onClick={() => user.id &&handleDelete(user.id)}
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
      <UserFormModal
        isOpen={modal.type !== null}
        onSuccess={handleUserSuccess}
        onClose={closeModal}
        userToEdit={modal.user ?? null}
      />
    </div>
  )
}