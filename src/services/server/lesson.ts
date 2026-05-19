'use server';

import camelcaseKeys from 'camelcase-keys';

import {
	UpsertLessonTitleFormData,
	UpdateLessonFormData,
} from '../shared/validations';

import {
	AppError,
	type Result,
	type LessonAndContentForEdit,
	type LessonForInsert,
	type UpdateLessonContentsDB,
	type UpdateLessonDB,
	type LessonTitles,
} from '@/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getLessonTitlesByCourseId(
	courseId: string,
): Promise<Result<LessonTitles>> {
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
		.from('lessons')
		.select('id, title, order_index')
		.eq('course_id', courseId)
		.order('order_index', { ascending: true });

	if (error) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: error.message || '取得課程單元失敗',
		};
	}

	const dto = camelcaseKeys(data);
	return {
		ok: true,
		data: dto,
	};
}

export async function getLessonsByCourseId(
	courseId: string,
): Promise<Result<LessonAndContentForEdit[]>> {
	const supabase = await createSupabaseServerClient();

	const { data, error } = await supabase
		.from('lessons')
		.select(
			`
			id, title, order_index,
			lesson_contents!left(video_url, content)
			`,
		)
		.eq('course_id', courseId)
		.order('order_index', { ascending: true });

	if (error) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: error.message || '取得課程單元失敗',
		};
	}

	const dto = data.map(({ lesson_contents, ...lesson }) => {
		return {
			...camelcaseKeys(lesson),
			videoUrl: lesson_contents?.video_url ?? null,
			content: lesson_contents?.content ?? null,
		};
	});

	return {
		ok: true,
		data: dto,
	};
}

export async function getLessonAndContentById(
	lessonId: string,
): Promise<Result<LessonAndContentForEdit>> {
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
		.from('lessons')
		.select(
			`
			id, title, order_index,
			lesson_contents!left(video_url, content)
			`,
		)
		.eq('id', lessonId)
		.single();

	if (error) {
		return {
			ok: false,
			code: error.code === 'PGRST116' ? AppError.NOT_FOUND : AppError.INTERNAL,
			message:
				error.code === 'PGRST116'
					? '找不到課程單元'
					: error.message || '取得課程單元失敗',
		};
	}

	const { lesson_contents, ...rest } = data;
	const dto = {
		...camelcaseKeys(rest),
		content: lesson_contents?.content ?? null,
		videoUrl: lesson_contents?.video_url ?? null,
	};

	return {
		ok: true,
		data: dto,
	};
}

// *** Mutations ***
export async function insertLesson(
	payload: UpsertLessonTitleFormData,
	courseId: string,
): Promise<Result<LessonForInsert>> {
	const supabase = await createSupabaseServerClient();

	const { data: maxIndexData } = await supabase
		.from('lessons')
		.select('order_index')
		.eq('course_id', courseId)
		.order('order_index', { ascending: false })
		.limit(1);

	const currentMaxIndex = maxIndexData?.[0]?.order_index ?? 0;

	const { data, error } = await supabase
		.from('lessons')
		.insert({
			...payload,
			order_index: currentMaxIndex + 1,
			course_id: courseId,
		})
		.select()
		.single();

	if (error) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: error.message || '新增課程單元失敗',
		};
	}

	return {
		ok: true,
		data: data,
	};
}

export async function updateLessonsOrder(
	courseId: string,
	orderedLessonIds: string[],
): Promise<Result<void>> {
	const supabase = await createSupabaseServerClient();

	const { error: rpcError } = await supabase.rpc('reorder_lessons', {
		p_course_id: courseId,
		p_lesson_ids: orderedLessonIds,
	});

	if (rpcError) {
		console.error('Reorder lessons error:', rpcError);
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: '更新單元順序失敗',
		};
	}

	return {
		ok: true,
		data: undefined,
	};
}

export async function updateLesson(
	lessonId: string,
	data: UpdateLessonFormData,
): Promise<Result<UpdateLessonContentsDB & UpdateLessonDB>> {
	const supabase = await createSupabaseServerClient();

	const [lesson, lessonContent] = await Promise.all([
		supabase
			.from('lessons')
			.update({
				title: data.title,
			})
			.eq('id', lessonId)
			.select()
			.single(),
		supabase
			.from('lesson_contents')
			.upsert(
				{
					lesson_id: lessonId,
					video_url: data.videoUrl || null,
					content: JSON.parse(data.content),
				},
				{
					onConflict: 'lesson_id',
				},
			)
			.eq('lesson_id', lessonId)
			.select()
			.single(),
	]);

	if (lesson.error) {
		return {
			ok: false,
			code:
				lesson.error.code === 'PGRST116'
					? AppError.NOT_FOUND
					: AppError.INTERNAL,
			message:
				lesson.error.code === 'PGRST116'
					? '找不到課程單元'
					: lesson.error.message || '更新課程單元失敗',
		};
	}

	if (lessonContent.error) {
		return {
			ok: false,
			code:
				lessonContent.error.code === 'PGRST116'
					? AppError.NOT_FOUND
					: AppError.INTERNAL,
			message:
				lessonContent.error.code === 'PGRST116'
					? '找不到課程單元'
					: lessonContent.error.message || '更新課程單元內容失敗',
		};
	}

	return {
		ok: true,
		data: {
			...lessonContent.data,
			...lesson.data,
		},
	};
}

export async function deleteLesson(lessonId: string): Promise<Result<null>> {
	const supabase = await createSupabaseServerClient();

	const { error } = await supabase.from('lessons').delete().eq('id', lessonId);

	if (error) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: error.message || '刪除課程單元失敗',
		};
	}

	return {
		ok: true,
		data: null,
	};
}

export async function removeLessonVideo(
	lessonId: string,
): Promise<Result<void>> {
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
		.from('lesson_contents')
		.update({ video_url: null })
		.eq('lesson_id', lessonId);

	if (error) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: error.message || '移除課程單元影片失敗',
		};
	}

	return {
		ok: true,
		data: undefined,
	};
}
