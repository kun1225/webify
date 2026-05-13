import type { Route } from 'next';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { CourseForCourseDetail } from '@/types';

export function CourseCta({
	data,
	className,
	handleBuy,
}: {
	data: CourseForCourseDetail;
	className?: string;
	handleBuy: () => void;
}) {
	const { isPurchased, price } = data || {};

	const ctaLabel = isPurchased
		? '前往我的課程'
		: price === 0
			? '立即觀看'
			: '立即購買';

	return (
		<Button
			size="lg"
			className={cn('mt-16', className)}
			onClick={() => !isPurchased && handleBuy()}
			asChild={isPurchased}
		>
			{isPurchased ? (
				<Link href={`/my-courses/${data.id}` as Route}>{ctaLabel}</Link>
			) : (
				ctaLabel
			)}
		</Button>
	);
}
