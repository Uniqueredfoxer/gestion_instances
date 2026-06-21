import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names and merges Tailwind CSS classes properly
 * @param inputs - Class names, objects, or arrays to combine
 * @returns Merged class string
 * 
 * @example
 * cn("bg-red-500", "text-white", { "p-4": true })
 * // → "bg-red-500 text-white p-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a readable string
 * @param date - Date object or string
 * @param format - Optional format (default: 'MMM DD, YYYY')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short') {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'relative') {
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 7) return formatDate(d, 'short')
    if (days > 1) return `${days} days ago`
    if (days === 1) return 'Yesterday'
    if (hours > 1) return `${hours} hours ago`
    if (hours === 1) return '1 hour ago'
    if (minutes > 1) return `${minutes} minutes ago`
    if (minutes === 1) return '1 minute ago'
    return 'Just now'
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  
  // short format
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Truncates a string to a specified length
 * @param str - String to truncate
 * @param length - Maximum length (default: 50)
 * @param ending - Ending character(s) (default: '...')
 * @returns Truncated string
 */
export function truncate(str: string, length: number = 50, ending: string = '...') {
  if (str.length <= length) return str
  return str.substring(0, length - ending.length) + ending
}

/**
 * Generates a random ID (useful for temporary keys)
 * @param length - Length of the ID (default: 8)
 * @returns Random string ID
 */
export function generateId(length: number = 8) {
  return Math.random().toString(36).substring(2, length + 2)
}

/**
 * Debounces a function call
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return function(this: unknown, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * Throttles a function call (ensures it runs at most once per interval)
 * @param fn - Function to throttle
 * @param interval - Interval in milliseconds (default: 300)
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  interval: number = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return function(this: unknown, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastCall >= interval) {
      lastCall = now
      fn.apply(this, args)
    }
  }
}

/**
 * Copies text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

/**
 * Capitalizes the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str || str.length === 0) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Pluralizes a word based on count
 * @param count - Number to check
 * @param singular - Singular form
 * @param plural - Plural form (optional, defaults to singular + 's')
 * @returns Properly pluralized word
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`
  return `${count} ${plural || singular + 's'}`
}

/**
 * Formats a number with commas
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param value - Value to check
 * @returns True if empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Sleep for a specified duration
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Safely parses JSON without throwing errors
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed JSON or fallback
 */
export function safeJSONParse<T = unknown>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}