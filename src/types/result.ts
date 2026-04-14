export const AppError = {
	UNAUTHENTICATED: 'UNAUTHENTICATED',
	FORBIDDEN: 'FORBIDDEN',
	NOT_FOUND: 'NOT_FOUND',
	INTERNAL: 'INTERNAL',
} as const;

export type Result<T> =
	| { ok: true; data: T }
	| {
			ok: false;
			code: (typeof AppError)[keyof typeof AppError];
			message: string;
	  };
