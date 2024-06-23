import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function firstOrNull<T = any>(arr: T[]): T | null {
	return arr[0] ?? null
}

export function getTimeZoneOffset(argOffsetMin?: number) {
	const offsetMin = argOffsetMin ?? new Date().getTimezoneOffset()
	if (offsetMin === 0) return 'UTC'
	const offsetHours = Math.floor(Math.abs(offsetMin) / 60)
	let offset = 'UTC'
	// flip the signs, since UTC is checked against local, not the other way around
	if (offsetMin < 0) offset += '+'
	else offset += '-'
	offset += `${offsetHours.toString().padStart(2, '0')}:${(Math.abs(offsetMin) - offsetHours * 60).toString().padStart(2, '0')}`
	return offset
}

export const NEXT_REDIRECT_ERROR_MESSAGE = 'NEXT_REDIRECT'
