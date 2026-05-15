'use client';

import { Upload } from 'tus-js-client';

import { AppError, type Result } from '@/types';
import { requireBrowserUser } from './auth';
import { getFileExtension } from './upload';

const LESSON_VIDEO_BUCKET = 'lesson-videos';
const LESSON_VIDEO_MIME_TO_EXTENSION: Record<string, string> = {
	'video/mp4': 'mp4',
	'video/webm': 'webm',
};

export async function uploadLessonVideo({
	file,
	courseId,
	lessonId,
	onProgress,
	onSuccess,
	onError,
}: {
	file: File;
	courseId: string;
	lessonId: string;
	onProgress?: (percentage: number) => void;
	onSuccess?: (path: string) => void;
	onError?: (error: Error) => void;
}): Promise<Result<void>> {
	const extension = getFileExtension(file, LESSON_VIDEO_MIME_TO_EXTENSION);

	if (!extension) {
		return {
			ok: false,
			code: AppError.FORBIDDEN,
			message: '只支援 MP4、WebM 格式',
		};
	}

	const userResult = await requireBrowserUser();

	if (!userResult.ok) return userResult;

	const { supabase, user } = userResult.data;
	const objectPath = `${user.id}/${courseId}/${crypto.randomUUID()}.${extension}`;

	const {
		data: { session },
		error: sessionError,
	} = await supabase.auth.getSession();

	if (sessionError || !session) {
		return {
			ok: false,
			code: AppError.UNAUTHENTICATED,
			message: '請先登入帳號',
		};
	}

	const updateLessonVideoUrl = async () => {
		const { error } = await supabase
			.from('lesson_contents')
			.update({
				video_url: objectPath,
			})
			.eq('lesson_id', lessonId)
			.select()
			.single();

		if (error) {
			throw new Error(error.message || '寫入影片路徑失敗');
		}
	};

	try {
		const projectId = getSupabaseProjectId();

		if (projectId) {
			await uploadLessonVideoWithTus({
				file,
				projectId,
				accessToken: session.access_token,
				objectPath,
				onProgress,
			});
		} else {
			const { error } = await supabase.storage
				.from(LESSON_VIDEO_BUCKET)
				.upload(objectPath, file, {
					upsert: true,
					contentType: file.type || 'video/mp4',
				});

			if (error) {
				throw new Error(error.message || '上傳失敗');
			}

			onProgress?.(100);
		}

		await updateLessonVideoUrl();
		onSuccess?.(objectPath);

		return {
			ok: true,
			data: undefined,
		};
	} catch (error) {
		onError?.(error as Error);
		return {
			ok: false,
			code: AppError.INTERNAL,
			message:
				error instanceof Error ? error.message : '影片上傳失敗，請稍後再試',
		};
	}
}

async function uploadLessonVideoWithTus({
	file,
	projectId,
	accessToken,
	objectPath,
	onProgress,
}: {
	file: File;
	projectId: string;
	accessToken: string;
	objectPath: string;
	onProgress?: (percentage: number) => void;
}) {
	await new Promise<void>((resolve, reject) => {
		const upload = new Upload(file, {
			endpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`,
			retryDelays: [0, 3000, 5000, 10000, 20000],
			headers: {
				authorization: `Bearer ${accessToken}`,
				'x-upsert': 'true',
			},
			uploadDataDuringCreation: true,
			removeFingerprintOnSuccess: true,
			metadata: {
				bucketName: LESSON_VIDEO_BUCKET,
				objectName: objectPath,
				contentType: file.type || 'video/mp4',
				cacheControl: '3600',
				metadata: JSON.stringify({
					fileName: file.name,
				}),
			},
			onProgress: (bytesSent, bytesTotal) => {
				const percentage = ((bytesSent / bytesTotal) * 100).toFixed(2);
				onProgress?.(Number(percentage));
			},
			onSuccess: () => {
				resolve();
			},
			onError: (error) => {
				reject(error);
			},
		});

		void upload.findPreviousUploads().then((previousUploads) => {
			if (previousUploads.length > 0) {
				upload.resumeFromPreviousUpload(previousUploads[0]);
			}

			upload.start();
		});
	});
}

function getSupabaseProjectId() {
	const explicitProjectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;

	if (explicitProjectId) {
		return explicitProjectId;
	}

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

	if (!supabaseUrl) {
		return null;
	}

	try {
		const hostname = new URL(supabaseUrl).hostname;

		if (!hostname.endsWith('.supabase.co')) {
			return null;
		}

		return hostname.split('.')[0] ?? null;
	} catch {
		return null;
	}
}
