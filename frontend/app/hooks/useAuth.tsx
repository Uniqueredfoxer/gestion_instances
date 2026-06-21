'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://directtrack.onrender.com/api';
if(!API_URL)console.log('environment variable not loaded...')

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Erreur de récupération de l'utilisateur stocké:", err);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, mdp: password })
      });
      
      const resData = await response.json();
      
      if (!response.ok || !resData.success) {
        return { success: false, error: resData.error || "Échec de la connexion." };
      }
      
      const { token, data: userData } = resData;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      if (userData && userData.role_dir) {
        router.push(`/${userData.role_dir}`);
      } else {
        console.warn("Attention: Aucun rôle trouvé pour cet utilisateur", userData);
      }

      return { success: true, user: userData };
    } catch (error: unknown) {
      return {
        success: false, 
        error: error instanceof Error ? error.message : "Une erreur inattendue est survenue",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};