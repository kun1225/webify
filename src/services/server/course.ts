'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
	AppError,
	type Result,
	type CourseForStudio,
	type InsertCourseDB,
	type CourseForEdit,
} from '@/types';
import { type UpsertCourseFormData } from '../shared/validations';
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

export async function upsertCourse(
	data: UpsertCourseFormData,
	courseId?: string,
): Promise<Result<Partial<InsertCourseDB>>> {
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

	const upsertPayload = {
		id: courseId,
		creator_id: user.id,
		title: data.title,
		slug: data.slug,
		description: data.description,
		cover_image_url: data?.coverImageUrl,
		price: data?.price ?? 0,
		duration: data?.duration ?? 0,
		is_hidden: data?.isHidden ?? false,
	};

	const { data: newCourse, error } = await supabase
		.from('courses')
		.upsert(upsertPayload, {
			onConflict: 'id',
		})
		.select()
		.single();

	if (error) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: error.message || '儲存課程失敗',
		};
	}

	return {
		ok: true,
		data: newCourse,
	};
}

export async function getCourseById(
	id: string,
): Promise<Result<CourseForEdit>> {
	const supabase = await createSupabaseServerClient();

	const { data, error } = await supabase
		.from('courses')
		.select(
			'id, title, slug, description, cover_image_url, price, duration, is_hidden',
		)
		.eq('id', id)
		.single();

	if (error) {
		return {
			ok: false,
			code: AppError.FORBIDDEN,
			message: '',
		};
	}

	return {
		ok: true,
		data: camelcaseKeys(data),
	};
}

export async function deleteCourse(id: string): Promise<Result<null>> {
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

	const { error } = await supabase
		.from('courses')
		.delete()
		.eq('id', id)
		.eq('creator_id', user.id)
		.select('id')
		.single();

	if (error) {
		return {
			ok: false,
			code: AppError.FORBIDDEN,
			message: '',
		};
	}

	return {
		ok: true,
		data: null,
	};
}
