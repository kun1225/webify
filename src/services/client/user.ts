'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { AppError, type Result } from '@/types';

const AVATAR_BUCKET = 'avatars';
const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;
const AVATAR_MIME_TO_EXTENSION: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/webp': 'webp',
};

export async function uploadAvatar(
	file: File,
): Promise<Result<{ path: string }>> {
	const supabase = createSupabaseBrowserClient();
	const fileValidationError = validateAvatarFile(file);

	if (fileValidationError) {
		return {
			ok: false,
			code: AppError.FORBIDDEN,
			message: fileValidationError,
		};
	}

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return {
			ok: false,
			code: AppError.UNAUTHENTICATED,
			message: authError?.message || '用戶未登入',
		};
	}

	const avatarPath = getAvatarPath(user.id, file);

	if (!avatarPath) {
		return {
			ok: false,
			code: AppError.FORBIDDEN,
			message: '不支援的檔案格式',
		};
	}

	const { data: currentProfile, error: profileError } = await supabase
		.from('users')
		.select('avatar_url')
		.eq('id', user.id)
		.single();

	if (profileError) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: profileError.message || '取得目前頭像失敗',
		};
	}

	const { data, error } = await supabase.storage
		.from(AVATAR_BUCKET)
		.upload(avatarPath, file, {
			upsert: true,
			contentType: file.type,
		});

	if (error) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: error.message || '上傳失敗',
		};
	}

	const updateResult = await supabase
		.from('users')
		.update({
			avatar_url: data.path,
		})
		.eq('id', user.id);

	if (updateResult.error) {
		await supabase.storage.from(AVATAR_BUCKET).remove([avatarPath]);

		return {
			ok: false,
			code: AppError.INTERNAL,
			message: updateResult.error.message || '更新頭像失敗',
		};
	}

	if (currentProfile?.avatar_url && currentProfile.avatar_url !== avatarPath) {
		await supabase.storage
			.from(AVATAR_BUCKET)
			.remove([currentProfile.avatar_url]);
	}

	return {
		ok: true,
		data: {
			path: data.path,
		},
	};
}

export async function deleteUserAvatar(): Promise<Result<null>> {
	const supabase = createSupabaseBrowserClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return {
			ok: false,
			code: AppError.UNAUTHENTICATED,
			message: authError?.message || 'Not logged in',
		};
	}

	const { data: currentProfile, error: profileError } = await supabase
		.from('users')
		.select('avatar_url')
		.eq('id', user.id)
		.single();

	if (profileError) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: profileError.message || '取得目前頭像失敗',
		};
	}

	const updateUserRes = await supabase
		.from('users')
		.update({ avatar_url: null })
		.eq('id', user.id);

	if (updateUserRes.error) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: updateUserRes.error.message || '刪除失敗',
		};
	}

	if (!currentProfile?.avatar_url) {
		return { ok: true, data: null };
	}

	const removeAvatarRes = await supabase.storage
		.from(AVATAR_BUCKET)
		.remove([currentProfile.avatar_url]);

	if (removeAvatarRes.error) {
		await supabase
			.from('users')
			.update({ avatar_url: currentProfile.avatar_url })
			.eq('id', user.id);

		return {
			ok: false,
			code: AppError.INTERNAL,
			message: removeAvatarRes.error.message || '刪除失敗',
		};
	}

	return { ok: true, data: null };
}

function getAvatarPath(userId: string, file: File) {
	const extension = AVATAR_MIME_TO_EXTENSION[file.type];

	if (!extension) {
		return null;
	}

	return `${userId}/avatar.${extension}`;
}

function validateAvatarFile(file: File) {
	if (!file) {
		return '缺少檔案';
	}

	if (!(file.type in AVATAR_MIME_TO_EXTENSION)) {
		return '僅支援 PNG、JPEG、WebP 格式';
	}

	if (file.size > MAX_AVATAR_FILE_SIZE) {
		return '檔案大小不可超過 5MB';
	}

	return null;
}
