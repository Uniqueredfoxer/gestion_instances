// app/components/ui/StatCard.tsx
'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number | undefined;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

const colorStyles = {
  primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
  secondary: 'bg-secondary-500/10 text-secondary-600 dark:text-secondary-400',
  success: 'bg-success-500/10 text-success-600 dark:text-success-400',
  warning: 'bg-warning-500/10 text-warning-600 dark:text-warning-400',
  error: 'bg-error-500/10 text-error-600 dark:text-error-400',
};

export function StatCard({ title, value, icon: Icon, trend, color = 'primary' }: StatCardProps) {
  return (
    <div className="card p-6 hover:shadow-md transition-all duration-200 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.isPositive ? 'text-success-500' : 'text-error-500'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color as keyof typeof colorStyles]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}