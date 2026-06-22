'use client'

import { Bell, Search, LogOut, Settings, User as UserIcon } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface HeaderProps {
  user?: {
    prenom: string
    nom: string
    email: string
    role_dir: string
    avatarUrl?: string | null
  } | null
  sidebarCollapsed?: boolean
}

export function Header({ 
  user, 
  sidebarCollapsed = false
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Recherche:', e.target.value)
  }

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 h-16 bg-white border-b border-gray-200 transition-all duration-300 z-20",
        "hidden md:block",
        sidebarCollapsed ? 'left-20' : 'left-64'
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un dossier, une tâche, un utilisateur..."
              onChange={handleInputChange}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

              <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-md hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600"/>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Avatar
                name={`${user?.prenom || 'U'} ${user?.nom || ''}`}
                src={user?.avatarUrl}
                size="sm"
              />
              
            </button>

            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-primary-600 mt-1 capitalize">
                      {user?.role_dir}
                    </p>
                  </div>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <UserIcon className="w-4 h-4" />
                    Mon Profil
                  </button>
                  
                  <div className="border-t border-gray-100 my-1" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}