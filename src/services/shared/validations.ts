import { z } from 'zod';

export const loginSchema = z.object({
	email: z.email('請輸入有效的電子郵件'),
	password: z.string().min(1, '請輸入密碼'),
});

export const signUpSchema = z
	.object({
		email: z.email('請輸入有效的電子郵件'),
		password: z.string().min(6, '密碼至少需要 6 個字元'),
		confirmPassword: z.string().min(1, '請確認密碼'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: '兩次輸入的密碼不一致',
		path: ['confirmPassword'],
	});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
