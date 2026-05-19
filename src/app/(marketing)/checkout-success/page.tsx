import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getStripe } from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';

import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const sessionId = params?.session_id as string | undefined;
	if (!sessionId) return notFound();

	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return notFound();

	const stripe = getStripe();
	const session = await stripe.checkout.sessions.retrieve(sessionId, {
		expand: ['line_items', 'customer'],
	});

	if (!session?.id) return notFound();
	if (session.metadata?.user_id !== user.id) return notFound();

	const item = session.line_items?.data?.[0];
	if (!item) return notFound();

	const { description, price } = item;
	const unitAmount = price?.unit_amount ?? 0;
	const formattedPrice = formatTwd(unitAmount);
	const orderNumber = (session.invoice as string) || session.id;

	const purchaseType = session.metadata?.purchase_type;
	const primaryLink = purchaseType === 'course' ? '/my-courses' : '/studio';
	const primaryLinkText = purchaseType === 'course' ? '前往課程' : '創建課程';

	return (
		<section className="px-edge relative flex min-h-[90vh] items-center justify-center">
			<Card className="border-border/60 w-full max-w-2xl shadow-lg transition-shadow duration-200 hover:shadow-xl">
				<CardHeader className="space-y-3 text-center">
					<div className="bg-success-background border-success-border mx-auto flex size-12 items-center justify-center rounded-full border">
						<CheckCircle2 className="text-success size-6" />
					</div>

					<Badge variant="secondary" className="mx-auto w-fit rounded-full">
						交易完成
					</Badge>

					<CardTitle className="t-heading-2 text-primary">購買成功</CardTitle>
				</CardHeader>

				<CardContent className="t-body-1">
					<div className="bg-muted rounded-lg border p-4">
						<div className="flex flex-col gap-4">
							<div className="grow">
								<p className="text-muted-foreground t-body-4">訂單編號</p>
								<p className="font-medium">{orderNumber}</p>
							</div>

							<div className="flex gap-8">
								<div>
									<p className="text-muted-foreground t-body-4">商品名稱</p>
									<p className="font-medium">{description}</p>
								</div>

								<div>
									<p className="text-muted-foreground t-body-4">金額</p>
									<p className="font-medium">{formattedPrice}</p>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<p className="text-muted-foreground t-body-4">
							若有問題，請回覆確認信或聯繫客服。
						</p>

						<div className="flex flex-wrap gap-2">
							<Button asChild variant="outline">
								<Link href="/">返回首頁</Link>
							</Button>

							<Button asChild>
								<Link href={primaryLink}>{primaryLinkText}</Link>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}

function formatTwd(cents: number) {
	const amount = cents / 100;
	if (!amount) return '免費課程';

	return new Intl.NumberFormat('zh-TW', {
		style: 'currency',
		currency: 'TWD',
		maximumFractionDigits: 0,
	}).format(amount);
}
