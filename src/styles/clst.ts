import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function clst(...classes: ClassValue[]): string {
  return twMerge(clsx(...classes))
}
