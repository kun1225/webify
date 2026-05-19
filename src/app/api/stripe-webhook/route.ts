import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
	if (!endpointSecret) {
		return new NextResponse('Missing STRIPE_WEBHOOK_SECRET', { status: 500 });
	}

	const buf = Buffer.from(await req.arrayBuffer());
	const signature = req.headers.get('stripe-signature');

	if (!signature) {
		return new NextResponse('Missing stripe-signature header', { status: 400 });
	}

	const supabaseAdmin = await createSupabaseAdminClient();
	const stripe = getStripe();

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(buf, signature, endpointSecret);

		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object;

				if (session.payment_status !== 'paid') {
					console.warn(
						'checkout.session.completed but payment_status is not paid:',
						session.payment_status,
					);
					break;
				}

				const userId = session.metadata?.user_id ?? session.client_reference_id;
				const purchaseType = session.metadata?.purchase_type;

				if (purchaseType === 'course') {
					const courseId = session.metadata?.course_id;
					if (!userId || !courseId) {
						console.warn('Missing user_id or course_id in session metadata');
						break;
					}

					const { data: course, error: courseError } = await supabaseAdmin
						.from('courses')
						.select('id, price')
						.eq('id', courseId)
						.single();

					if (courseError || !course) {
						console.error('Course not found for courseId:', courseId);
						break;
					}

					const expectedAmount = Math.round(course.price * 100);
					if (session.amount_total !== expectedAmount) {
						console.error('Amount mismatch for course purchase:', {
							expected: expectedAmount,
							actual: session.amount_total,
							courseId,
							userId,
						});
						break;
					}

					const { error } = await supabaseAdmin
						.from('user_course_enrollments')
						.upsert(
							{
								user_id: userId,
								course_id: courseId,
							},
							{ onConflict: 'user_id,course_id' },
						);

					if (error) {
						throw error;
					}
				}

				break;
			}

			default:
				console.warn(`Unhandled event type ${event.type}`);
				break;
		}

		return NextResponse.json({ received: true });
	} catch (err) {
		console.error(err);

		if (err instanceof Error) {
			return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
		}

		return new NextResponse('Webhook Error', { status: 400 });
	}
}
