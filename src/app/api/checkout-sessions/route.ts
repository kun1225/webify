import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { AppError } from '@/types';

export async function POST(req: NextRequest) {
	try {
		const headersList = await headers();
		const origin = getCheckoutBaseUrl(req, headersList);
		const { metadata, cancelUrl } = await req.json();

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
			.select('id, title, price, cover_image_url, is_hidden')
			.eq('id', courseId)
			.single();

		if (courseError || !course) {
			return NextResponse.json({
				ok: false,
				code: AppError.FORBIDDEN,
				message: '課程不存在',
			});
		}

		if (course.is_hidden) {
			return NextResponse.json({
				ok: false,
				code: AppError.FORBIDDEN,
				message: '課程不開放購買',
			});
		}

		const unitAmount = Math.round(course.price * 100);
		const stripe = getStripe();
		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price_data: {
						currency: 'twd',
						unit_amount: unitAmount,
						product_data: {
							name: course.title,
							description: 'Webify 線上課程',
							images: course.cover_image_url ? [course.cover_image_url] : [],
						},
					},
					quantity: 1,
				},
			],
			mode: 'payment',
			payment_method_types: ['card'],
			locale: 'zh-TW',
			invoice_creation: {
				enabled: true,
			},
			success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}${cancelUrl || ''}`,
			customer_email: user.email,
			metadata: {
				user_id: user.id,
				...metadata,
			},
		});

		return NextResponse.json({
			ok: true,
			data: {
				url: session.url,
			},
		});
	} catch (err) {
		console.error('Failed to create checkout session:', err);

		return NextResponse.json({
			ok: false,
			code: AppError.INTERNAL,
			message: 'Internal server error',
		});
	}
}

function getCheckoutBaseUrl(req: NextRequest, headersList: Headers) {
	const siteUrl =
		process.env.NEXT_PUBLIC_SITE_URL ||
		(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
		headersList.get('origin') ||
		req.nextUrl.origin;

	if (!/^https?:\/\//.test(siteUrl)) {
		throw new Error('Missing valid site URL for Stripe checkout redirects');
	}

	return siteUrl.replace(/\/$/, '');
}
