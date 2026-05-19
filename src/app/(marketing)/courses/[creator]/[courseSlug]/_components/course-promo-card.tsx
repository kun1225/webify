'use client';

import Image from 'next/image';
import { Orbit } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Card, CardContent } from '@/components/ui/card';
import { CourseCta } from './course-cta';

import { CourseForCourseDetail } from '@/types';

const currencyFormatter = new Intl.NumberFormat('zh-TW', {
	style: 'currency',
	currency: 'TWD',
	maximumFractionDigits: 0,
});

export function CoursePromoCard({
	data,
	className,
	handleBuy,
}: {
	data: CourseForCourseDetail;
	className?: string;
	handleBuy: () => void | Promise<void>;
}) {
	const { title, coverImageUrl, price } = data || {};

	const formattedPrice =
		price === 0 ? '免費課程' : `NT${currencyFormatter.format(price)}`;

	return (
		<Card className={cn('relative pt-0 duration-300', className)}>
			<div className="relative aspect-video w-full overflow-hidden">
				<div className="bg-muted size-full">
					{coverImageUrl ? (
						<Image src={coverImageUrl} alt={title} fill />
					) : (
						<Orbit className="text-secondary size-full p-8" />
					)}
				</div>
			</div>

			<CardContent className="flex h-full flex-col text-pretty">
				{title && <h3 className="t-heading-5">{title}</h3>}

				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<p className="t-heading-3 text-primary font-bold">{formattedPrice}</p>
				</div>

				<CourseCta data={data} handleBuy={handleBuy} />
			</CardContent>
		</Card>
	);
}
