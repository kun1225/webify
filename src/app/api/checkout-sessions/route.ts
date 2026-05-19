import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { AppError } from '@/types';

const CREATOR_UPGRADE_PRICE = 6990;
const CREATOR_UPGRADE_TITLE = '終生創作者方案';

export async function POST(req: NextRequest) {
	try {
		const headersList = await headers();
		const origin = getCheckoutBaseUrl(req, headersList);
		const { metadata, cancelUrl } = await req.json();

		const purchaseType = metadata?.purchase_type;

		if (purchaseType !== 'course' && purchaseType !== 'lifetime_creator') {
			return NextResponse.json({
				ok: false,
				code: AppError.FORBIDDEN,
				message: '購買類型不正確',
			});
		}

		if (purchaseType === 'course' && !metadata?.course_id) {
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

		let title: string;
		let unitAmount: number;
		let coverImageUrl: string | null = null;
		let productDescription: string;

		if (purchaseType === 'course') {
			const { data: course, error: courseError } = await supabase
				.from('courses')
				.select('id, title, price, cover_image_url, is_hidden')
				.eq('id', metadata.course_id)
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

			title = course.title;
			unitAmount = Math.round(course.price * 100);
			coverImageUrl = course.cover_image_url;
			productDescription = 'Webify 線上課程';
		} else {
			title = CREATOR_UPGRADE_TITLE;
			unitAmount = Math.round(CREATOR_UPGRADE_PRICE * 100);
			productDescription = 'Webify 終生創作者方案';
		}

		const stripe = getStripe();
		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price_data: {
						currency: 'twd',
						unit_amount: unitAmount,
						product_data: {
							name: title,
							description: productDescription,
							images: coverImageUrl ? [coverImageUrl] : [],
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
