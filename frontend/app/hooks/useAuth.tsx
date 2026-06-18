
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async()=>{
      try{
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        setLoading(false);
      }catch(err){
        console.error(err);
      }
    }
    getUser()
  }, []);

  const routes: Record<string, string> = {
    admin: '/admin',
    directeur: '/directeur',
    intervenant: '/intervenant',
  };
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {method:'POST', headers:{'Content-Type': 'application/json'}, credentials:'include', body: JSON.stringify({email:email, mdp:password})});
      const { userWithouthPassword: user } = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      router.push(routes[user.role_dir]);
      return { success: true };
    } catch (error: unknown) {
      return {success: false, error: error instanceof Error ? error.message : "An unexpected error occurred",
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