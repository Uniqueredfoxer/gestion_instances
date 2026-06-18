import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names and handles Tailwind conflicts
 * Example: cn('p-4', 'p-8') → 'p-8' (last one wins)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ========================================
// Date Helpers
// ========================================

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  return d.toISOString().split('T')[0]
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return formatDate(date)
}

// ========================================
// Status & Priority Helpers
// ========================================

export function getStatusColor(status: string){
  const colors= {
    dossierStatus: {
        'DRAFT': 'bg-muted text-muted-foreground',
        'ACTIVE': 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
        'ON_HOLD': 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
        'COMPLETED': 'bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400',
        'OVERDUE': 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400',
        'CANCELLED': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
},
    
    
    taskStatus: {
        'NOT_STARTED': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        'IN_PROGRESS': 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
        'WAITING_VALIDATION': 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
        'COMPLETED': 'bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400',
        'BLOCKED': 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400'
},
    
    
    userStatus: {
        'ACTIVE': 'bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400',
        'INACTIVE': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        'SUSPENDED': 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400',}
    
  }
  return colors || 'bg-muted text-muted-foreground'
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'CRITICAL': 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    'HIGH': 'bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
    'MEDIUM': 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
    'LOW': 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  }
  return colors[priority] || 'bg-muted text-muted-foreground'
}

export function getPriorityBadgeColor(priority: string): string {
  const colors: Record<string, string> = {
    'CRITICAL': 'bg-error-500/10 text-error-500',
    'HIGH': 'bg-warning-500/10 text-warning-500',
    'MEDIUM': 'bg-primary-50 text-primary-600',
    'LOW': 'bg-muted text-muted-foreground',
  }
  return colors[priority] || 'bg-muted text-muted-foreground'
}


export function getInitials(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return '?'
  const first = firstName?.[0] || ''
  const last = lastName?.[0] || ''
  return `${first}${last}`.toUpperCase()
}

export function getUserFullName(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return 'Unknown User'
  return `${firstName || ''} ${lastName || ''}`.trim()
}

// ========================================
// Text Helpers
// ========================================

export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function capitalizeFirstLetter(string: string): string {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export function kebabToTitleCase(text: string): string {
  if (!text) return ''
  return text
    .split('-')
    .map(word => capitalizeFirstLetter(word))
    .join(' ')
}

// ========================================
// Number Helpers
// ========================================

export function formatNumber(num: number): string {
  if (num < 1000) return num.toString()
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K'
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M'
  return (num / 1000000000).toFixed(1) + 'B'
}

export function formatPercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// ========================================
// Class Name Utilities
// ========================================

export function classNames(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ========================================
// Array Helpers
// ========================================

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// ========================================
// Object Helpers
// ========================================

export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

// ========================================
// Validation Helpers
// ========================================

export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function isValidUUID(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return regex.test(uuid)
}

// ========================================
// Environment Helpers
// ========================================

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function isTest(): boolean {
  return process.env.NODE_ENV === 'test'
}