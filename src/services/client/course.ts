'use client';

import { AppError, type Result } from '@/types';
import { requireBrowserUser } from './auth';
import { getFileExtension, validateUploadFile } from './upload';

const COURSE_COVER_BUCKET = 'course-covers';
const MAX_COURSE_COVER_FILE_SIZE = 20 * 1024 * 1024;
const COURSE_COVER_MIME_TO_EXTENSION: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/webp': 'webp',
};

export async function uploadCourseCover(file: File): Promise<Result<string>> {
	const fileValidationError = validateUploadFile(file, {
		maxFileSize: MAX_COURSE_COVER_FILE_SIZE,
		maxFileSizeLabel: '20MB',
		mimeToExtension: COURSE_COVER_MIME_TO_EXTENSION,
	});

	if (fileValidationError) {
		return {
			ok: false,
			code: AppError.FORBIDDEN,
			message: fileValidationError,
		};
	}

	const userResult = await requireBrowserUser();

	if (!userResult.ok) return userResult;

	const { supabase, user } = userResult.data;

	const courseCoverPath = getCourseCoverPath(user.id, file);

	if (!courseCoverPath) {
		return {
			ok: false,
			code: AppError.FORBIDDEN,
			message: '不支援的檔案格式',
		};
	}

	const { error } = await supabase.storage
		.from(COURSE_COVER_BUCKET)
		.upload(courseCoverPath, file, {
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

	const {
		data: { publicUrl },
	} = supabase.storage.from(COURSE_COVER_BUCKET).getPublicUrl(courseCoverPath);

	return {
		ok: true,
		data: publicUrl,
	};
}

function getCourseCoverPath(userId: string, file: File) {
	const extension = getFileExtension(file, COURSE_COVER_MIME_TO_EXTENSION);

	if (!extension) {
		return null;
	}

	return `${userId}/${crypto.randomUUID()}.${extension}`;
}
