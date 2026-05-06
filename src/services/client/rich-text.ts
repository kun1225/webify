import { AppError, Result } from '@/types/result';
import { requireBrowserUser } from '../client/auth';

export async function uploadRichTextImage(file: File): Promise<Result<string>> {
	const userResult = await requireBrowserUser();
	if (!userResult.ok) return userResult;

	const { supabase, user } = userResult.data;

	const uuid = crypto.randomUUID();
	const fileName = `${uuid}.${file.name.split('.').pop()}`;
	const path = `${user.id}/${fileName}`;

	const { error } = await supabase.storage
		.from('rich-text-images')
		.upload(path, file, {
			upsert: true, // if the file already exists, it will be replaced
			metadata: {
				fileName: file.name,
			},
		});

	if (error) {
		console.error('uploadRichTextImage ~ error:', error);
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: '上傳失敗',
		};
	}

	const { data } = supabase.storage.from('rich-text-images').getPublicUrl(path);

	return {
		ok: true,
		data: data.publicUrl,
	};
}
