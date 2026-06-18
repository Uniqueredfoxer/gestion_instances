// app/(auth)/layout.tsx - Keep it clean without Header
'use client';

import { AuthProvider } from '@/app/hooks/useAuth';
import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-primary-950 flex flex-col">
        {/* Simple Logo Header for Auth Pages */}
        <div className="pt-8 px-4">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-700 dark:text-primary-400">
                ESI DirectTrack
              </h1>
              <p className="text-xs text-muted-foreground">Gestion de projets</p>
            </div>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          {children}
        </div>

        {/* Footer */}
        <footer className="py-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 ESI DirectTrack. Tous droits réservés.</p>
        </footer>
      </div>
    </AuthProvider>
  );
}