'use server';

import {
	createSupabaseAdminClient,
	createSupabaseServerClient,
} from '@/lib/supabase/server';
import { profileSchema, type ProfileFormData } from '../shared/validations';
import snakecaseKeys from 'snakecase-keys';
import { AppError, type Result, type UserProfile } from '@/types';

export async function updateUserProfile(
	data: ProfileFormData,
): Promise<Result<UserProfile>> {
	const supabase = await createSupabaseServerClient();

	const validated = profileSchema.safeParse(data);
	if (!validated.success) {
		return {
			ok: false,
			code: AppError.FORBIDDEN,
			message: '請確認輸入資料是否正確',
		};
	}

	const profile = validated.data;

	// 不要從前端接收 userId，因為我們不能信任前端傳來的使用者身份
	const { data: auth, error: authError } = await supabase.auth.getUser();
	const userId = auth.user?.id;
	if (!userId) {
		return {
			ok: false,
			code: AppError.UNAUTHENTICATED,
			message: authError?.message || 'Not logged in',
		};
	}

	// 檢查這個名稱是否已經被其他使用者使用，更好的選擇是在資料庫用 trigger 做檢查，但這邊我們直接在後端這樣做
	const { data: existingUsers } = await supabase
		.from('users')
		.select('id')
		.eq('full_name', profile.fullName)
		.neq('id', userId)
		.limit(1);

	if (existingUsers && existingUsers.length > 0) {
		return { ok: false, code: AppError.FORBIDDEN, message: '使用者名稱已存在' };
	}

	const { data: updatedProfile, error } = await supabase
		.from('users')
		.update(snakecaseKeys(profile))
		.eq('id', userId)
		.select() // Will not return updated data if we only call update() without select()
		.single();

	// We should write a trigger to update the full_name in auth.users table
	// but for now, we can simply update it here
	const { error: updateAuthError } = await supabase.auth.updateUser({
		data: {
			full_name: profile.fullName,
		},
	});

	if (error || updateAuthError) {
		console.error('Error updating user profile:', error || updateAuthError);
		return {
			ok: false,
			code: AppError.INTERNAL,
			message:
				error?.message ||
				updateAuthError?.message ||
				'Failed to update user profile',
		};
	}

	return {
		ok: true,
		data: updatedProfile,
	};
}

export async function upgradeCurrentUserToCreator(): Promise<Result<null>> {
	const supabase = await createSupabaseServerClient();
	const supabaseAdmin = await createSupabaseAdminClient();

	const { data: auth, error: authError } = await supabase.auth.getUser();
	const userId = auth.user?.id;

	if (!userId) {
		return {
			ok: false,
			code: AppError.UNAUTHENTICATED,
			message: authError?.message || '請先登入帳號',
		};
	}

	const { error } = await supabaseAdmin
		.from('users')
		.update({ role: 'creator' })
		.eq('id', userId);

	if (error) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: error.message || '升級失敗，請稍後再試',
		};
	}

	return {
		ok: true,
		data: null,
	};
}
