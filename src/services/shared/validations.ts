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

export const profileSchema = z.object({
	fullName: z.string().min(1, '請輸入姓名').max(100, '姓名不能超過 100 個字元'),
});

export const upsertCourseFormSchema = z.object({
	title: z
		.string({
			error: () => '請輸入課程標題',
		})
		.min(1, '請輸入課程標題')
		.max(100, '標題不能超過 100 個字元'),
	slug: z
		.string({
			error: () => '請輸入課程網址',
		})
		.min(1, '請輸入課程網址')
		.max(100, '網址不能超過 100 個字元'),
	coverImageUrl: z
		.string({
			error: () => '請上傳課程封面',
		})
		.min(1, '請上傳課程封面'),
	description: z.any(),
	price: z.number().min(0, '價格不能為負數').max(999999, '價格不能超過99999'),
	duration: z
		.number()
		.min(0, '時長不能為負數')
		.max(999999, '時長不能超過99999'),
	isHidden: z.boolean(),
});

export const upsertLessonTitleFormSchema = z.object({
	title: z
		.string({
			error: () => '請輸入單元名稱',
		})
		.min(1, '請輸入單元名稱')
		.max(100, '名稱不能超過100個字元'),
});

export const updateLessonFormSchema = z.object({
	title: z
		.string({
			error: () => '請輸入單元名稱',
		})
		.min(1, '請輸入單元名稱')
		.max(50, '名稱不能超過50個字元'),
	videoUrl: z.string().optional(),
	content: z.any(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type UpsertCourseFormData = z.infer<typeof upsertCourseFormSchema>;
export type UpsertLessonTitleFormData = z.infer<
	typeof upsertLessonTitleFormSchema
>;
export type UpdateLessonFormData = z.infer<typeof updateLessonFormSchema>;
