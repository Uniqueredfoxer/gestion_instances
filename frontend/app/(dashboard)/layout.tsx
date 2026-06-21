'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { MobileHeader } from '@/components/MobileHeader'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMenuToggle = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const handleMobileClose = () => {
    setIsMobileOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen mt-16 bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onMobileClose={handleMobileClose}
      />

      <Header 
        user={user} 
        sidebarCollapsed={sidebarCollapsed}
      />

      <MobileHeader 
        user={user}
        isMobileOpen={isMobileOpen}
        onMenuToggle={handleMenuToggle}
      />

      <div 
        className={cn(
          "flex flex-col min-h-screen pt-16 transition-all duration-300",
          "p-4 md:p-6",
          sidebarCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        <main className="flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}