'use server';

import camelcaseKeys from 'camelcase-keys';

import {
	createSupabaseAdminClient,
	createSupabaseServerClient,
} from '@/lib/supabase/server';
import {
	AppError,
	type CourseForPurchased,
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
	const {
		data: { user },
	} = await supabase.auth.getUser();
	let isPurchased = false;

	if (user) {
		const { data: enrollment } = await supabase
			.from('user_course_enrollments')
			.select('course_id')
			.eq('user_id', user.id)
			.eq('course_id', course.id)
			.maybeSingle();

		isPurchased = !!enrollment;
	}

	return {
		ok: true,
		data: {
			...camelcaseKeys(course),
			creator: creator ?? '',
			lessons: (lessons ?? []).map((lesson) => camelcaseKeys(lesson)),
			isPurchased,
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

export async function getPurchasedCourses(): Promise<
	Result<CourseForPurchased[]>
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

	const { data, error } = await supabase
		.from('user_course_enrollments')
		.select(
			`
			course_id,
			courses (
				id,
				title,
				slug,
				cover_image_url,
				duration,
				is_hidden,
				users!courses_creator_id_fkey (
					full_name
				)
			)
		`,
		)
		.eq('user_id', user.id)
		.order('enrolled_at', { ascending: false });

	if (error) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: error.message || '取得我的課程失敗',
		};
	}

	const courses = data
		.map(({ course_id: courseId, courses }) => {
			if (!courses) return null;

			const creator = Array.isArray(courses.users)
				? courses.users[0]?.full_name
				: courses.users?.full_name;

			return {
				id: courseId,
				title: courses.title,
				slug: courses.slug,
				coverImageUrl: courses.cover_image_url,
				duration: courses.duration,
				isHidden: courses.is_hidden,
				creator: creator ?? '',
			};
		})
		.filter((course): course is CourseForPurchased => course !== null);

	return {
		ok: true,
		data: courses,
	};
}

export async function getPurchasedCourseDetail(
	courseId: string,
): Promise<Result<CourseForCourseDetail>> {
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

	const { data, error } = await supabase
		.from('user_course_enrollments')
		.select(
			`
			courses (
				id,
				title,
				slug,
				description,
				cover_image_url,
				price,
				duration,
				is_hidden,
				purchases,
				updated_at,
				users!courses_creator_id_fkey (
					full_name
				),
				lessons!left (
					id,
					title,
					order_index
				)
			)
		`,
		)
		.eq('user_id', user.id)
		.eq('course_id', courseId)
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

	if (!data.courses) {
		return {
			ok: false,
			code: AppError.NOT_FOUND,
			message: '找不到指定的課程',
		};
	}

	const { users, lessons = [], ...course } = data.courses;
	const creator = Array.isArray(users) ? users[0]?.full_name : users?.full_name;
	const sortedLessons = lessons
		.map((lesson) => camelcaseKeys(lesson))
		.sort((a, b) => a.orderIndex - b.orderIndex);

	return {
		ok: true,
		data: {
			...camelcaseKeys(course),
			creator: creator ?? '',
			lessons: sortedLessons,
			isPurchased: true,
		},
	};
}
