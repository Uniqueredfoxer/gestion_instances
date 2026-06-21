'use client'

import { Bell, LogOut, Settings, User as UserIcon, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

interface MobileHeaderProps {
  user?: {
    prenom: string
    nom: string
    email: string
    role_dir: string
    avatarUrl?: string | null
  } | null
  isMobileOpen?: boolean
  onMenuToggle?: () => void
}

export function MobileHeader({ 
  user, 
  isMobileOpen = false,
  onMenuToggle 
}: MobileHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 md:hidden">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              DT
            </div>
            <span className="text-lg font-bold text-gray-900">
              DirectTrack
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">


          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
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
                  </div>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <UserIcon className="w-4 h-4" />
                    Mon Profil
                  </button>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4" />
                    Paramètres
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