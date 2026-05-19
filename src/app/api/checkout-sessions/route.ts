import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AppError } from '@/types';

export async function POST(req: NextRequest) {
	try {
		const headersList = await headers();
		const origin = headersList.get('origin') ?? '';
		const { metadata } = await req.json();

		const courseId = metadata?.course_id;
		const purchaseType = metadata?.purchase_type;

		if (purchaseType !== 'course' || !courseId) {
			return NextResponse.json({
				ok: false,
				code: AppError.FORBIDDEN,
				message: '購買資料不完整',
			});
		}

		const supabase = await createSupabaseServerClient();
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return NextResponse.json({
				ok: false,
				code: AppError.UNAUTHENTICATED,
				message: '請先登入',
			});
		}

		const { data: course, error: courseError } = await supabase
			.from('courses')
			.select('id, is_hidden')
			.eq('id', courseId)
			.single();

		if (courseError || !course) {
			return NextResponse.json({
				ok: false,
				code:
					courseError?.code === 'PGRST116'
						? AppError.NOT_FOUND
						: AppError.INTERNAL,
				message:
					courseError?.code === 'PGRST116'
						? '找不到指定的課程'
						: courseError?.message || '購買課程失敗',
			});
		}

		if (course.is_hidden) {
			return NextResponse.json({
				ok: false,
				code: AppError.FORBIDDEN,
				message: '此課程目前無法購買',
			});
		}

		const { error } = await supabase.from('user_course_enrollments').upsert(
			{
				user_id: user.id,
				course_id: courseId,
			},
			{
				onConflict: 'user_id,course_id',
				ignoreDuplicates: true,
			},
		);

		if (error) {
			return NextResponse.json({
				ok: false,
				code: AppError.INTERNAL,
				message: error.message || '購買課程失敗',
			});
		}

		return NextResponse.json({
			ok: true,
			data: {
				url: `${origin}/my-courses/${courseId}`,
			},
		});
	} catch (err) {
		console.error(err);

		return NextResponse.json({
			ok: false,
			code: AppError.INTERNAL,
			message: 'Internal server error',
		});
	}
}
