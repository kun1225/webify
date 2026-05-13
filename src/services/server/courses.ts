'use server';

import camelcaseKeys from 'camelcase-keys';

import {
	createSupabaseAdminClient,
	createSupabaseServerClient,
} from '@/lib/supabase/server';
import {
	AppError,
	type CourseForCourseDetail,
	type CoursesWithPagination,
	type Result,
} from '@/types';

export async function getCoursesWithFilters(): Promise<
	Result<CoursesWithPagination>
> {
	const supabase = await createSupabaseServerClient();
	const page = 1;
	const limit = 9;
	const priceMin = 0;
	const sortBy = 'created_at';

	const from = (page - 1) * limit;
	const to = from + limit - 1;

	const { data, error, count } = await supabase
		.from('courses')
		.select(
			'id, title, slug, cover_image_url, price, creator_id, duration, users!left(full_name)',
			{ count: 'exact' },
		)
		.eq('is_hidden', false)
		.gte('price', priceMin)
		.order(sortBy, { ascending: false })
		.range(from, to);

	if (error) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: error.message || '取得課程列表失敗',
		};
	}

	const total = count ?? 0;
	const totalPages = Math.ceil(total / limit);

	return {
		ok: true,
		data: {
			courses: data.map(({ users, ...rest }) => ({
				...camelcaseKeys(rest),
				creator: users?.full_name,
			})),
			pagination: {
				total,
				totalPages,
			},
			hasMore: page < totalPages,
		},
	};
}

export async function getCourseBySlug(
	slug: string,
): Promise<Result<CourseForCourseDetail>> {
	const supabase = await createSupabaseServerClient();

	const { data, error } = await supabase
		.from('courses')
		.select(
			'id, title, slug, description, cover_image_url, price, duration, purchases, updated_at, is_hidden, users!courses_creator_id_fkey(full_name), lessons!left(id, title, order_index)',
		)
		.eq('slug', slug)
		.eq('is_hidden', false)
		.single();

	if (error) {
		return {
			ok: false,
			code: error.code === 'PGRST116' ? AppError.NOT_FOUND : AppError.INTERNAL,
			message:
				error.code === 'PGRST116'
					? '找不到指定的課程'
					: error.message || '取得課程失敗',
		};
	}

	const { users, lessons, ...course } = data;
	const creator = Array.isArray(users) ? users[0]?.full_name : users?.full_name;

	return {
		ok: true,
		data: {
			...camelcaseKeys(course),
			creator: creator ?? '',
			lessons: (lessons ?? []).map((lesson) => camelcaseKeys(lesson)),
			isPurchased: false,
		},
	};
}

export async function getCourseSlugsAndCreator(): Promise<
	Result<{ creator: string; courseSlug: string }[]>
> {
	const supabase = await createSupabaseAdminClient();

	const { data, error } = await supabase
		.from('courses')
		.select('slug, users!courses_creator_id_fkey(full_name)')
		.eq('is_hidden', false)
		.order('created_at', { ascending: false });

	if (error) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: error.message || '取得課程網址失敗',
		};
	}

	return {
		ok: true,
		data: data.map(({ slug, users }) => {
			const creator = Array.isArray(users)
				? users[0]?.full_name
				: users?.full_name;

			return {
				creator: creator ?? '',
				courseSlug: slug,
			};
		}),
	};
}
