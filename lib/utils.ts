import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function checkCooldown(lastChangeDate: Date | string | null | undefined): boolean {
  if (!lastChangeDate) return true

  const lastDate = new Date(lastChangeDate)
  const today = new Date()

  const diffTime = Math.abs(today.getTime() - lastDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays >= 30
}
