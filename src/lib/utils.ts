import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function hasArrayValue(value: unknown): value is unknown[] {
	return Array.isArray(value) && value.length > 0;
}

export function hasValueObject(
	value: unknown,
): value is Record<string, unknown> {
	return (
		typeof value === 'object' && value !== null && Object.keys(value).length > 0
	);
}
