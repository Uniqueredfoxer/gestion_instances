'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LucideLayoutDashboard,
  ClipboardList,
  AlertCircle,
  CalendarDays,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import type { User } from '@/types'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  user: User
}

export function Sidebar({ collapsed, onToggle, user }: SidebarProps) {
  const { logout } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigation = {
    admin: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Dossiers', href: '/admin/dossiers', icon: FolderKanban },
      { name: 'Utilisateurs', href: '/admin/utilisateurs', icon: Users },
      { name: 'Alertes', href: '/admin/alerts', icon: AlertCircle }
    ],
    directeur: [
      { name: 'DashBoard', href: '/directeur', icon: LucideLayoutDashboard },
      { name: 'Dossiers', href: '/directeur/dossiers', icon: FolderKanban },
      { name: 'Taches', href: '/directeur/taches', icon: ClipboardList}
    ],
    intervenant: [
      { name: 'Dashboard', href: '/intervenant', icon: LayoutDashboard },
      { name: 'Taches', href: '/intervenant/mes-taches', icon: ClipboardList },
      { name: 'Calendrier', href: '/intervenant/calendrier', icon: CalendarDays },
      { name: 'Alertes', href: '/intervenant/alertes', icon: AlertCircle }
    ]
  }

  const handleLogout = async () => {
    logout()
  }

  return (
    <>
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-white shadow-md border-gray-200"
        >
          {mobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
        </Button>
      </div>

      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 flex flex-col",
          collapsed ? "md:w-20" : "md:w-64",
          "w-64 -translate-x-full md:translate-x-0",
          mobileOpen && "translate-x-0"
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-gray-200 justify-between md:justify-start">
          <div className="flex items-center gap-2 pl-12 md:pl-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
              DT
            </div>
            <span className={cn(
              "text-lg font-bold text-gray-900 whitespace-nowrap md:inline",
              collapsed ? "md:hidden" : "md:inline"
            )}>
              DirectTrack
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation[user?.role_dir || 'intervenant'].map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap md:inline",
                  collapsed ? "md:hidden" : "md:inline"
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className={cn(
            "flex items-center gap-3",
            collapsed ? "md:flex-col md:items-center md:gap-2" : "flex-row"
          )}>
            <Avatar
              name={user?.prenom + ' ' + user?.nom}
              src=''
              size={collapsed ? "sm" : "md"}
              className="md:block"
            />
            <div className={cn(
              "flex-1 min-w-0",
              collapsed ? "md:hidden" : "block"
            )}>
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.prenom} {user?.nom}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="hidden md:block absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </aside>
    </>
  )
}