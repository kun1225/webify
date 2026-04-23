'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AppError, type Result, type CourseForStudio } from '@/types';
import camelcaseKeys from 'camelcase-keys';

export async function getCreatorCourses(): Promise<
	Result<{
		courses: CourseForStudio[];
	}>
> {
	const supabase = await createSupabaseServerClient();

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		return {
			ok: false,
			code: AppError.UNAUTHENTICATED,
			message: '請先登入',
		};
	}

	const { data: coursesData, error: coursesError } = await supabase
		.from('courses')
		.select(
			'id, title, slug, price, purchases, cover_image_url, is_hidden, updated_at, created_at',
		)
		.eq('creator_id', user.id);

	if (coursesError) {
		console.error('Error getting courses:', coursesError);
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: '系統繁忙，請稍後再試',
		};
	}

	const dtoCourses = coursesData?.map((course) => camelcaseKeys(course));

	return {
		ok: true,
		data: {
			courses: dtoCourses || [],
		},
	};
}
