import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { CourseForCourses } from '@/types';

export function CoursesCard({
	data,
	className,
}: {
	data: CourseForCourses;
	className?: string;
}) {
	const { slug, title, coverImageUrl, creator, price, duration } = data || {};

	const courseUrl = `/courses/${creator}/${slug}`;

	const priceLabel =
		price === 0
			? '免費課程'
			: price.toLocaleString('zh-TW', {
					style: 'currency',
					currency: 'TWD',
					minimumFractionDigits: 0,
				});

	const durationLabel =
		duration && duration > 0 ? `課程約 ${duration} 小時` : '無課程時長';

	return (
		<Link href={courseUrl}>
			<Card
				className={cn(
					'group relative flex-row gap-4 overflow-hidden rounded-none border border-transparent bg-transparent py-3 transition-shadow duration-300',
					'lg:bg-card lg:border-border lg:h-full lg:flex-col lg:gap-6 lg:rounded-lg lg:pt-0 lg:pb-8 lg:hover:shadow-md',
					className,
				)}
			>
				<div className="-my-8 aspect-video basis-1/3 lg:my-0 lg:w-full">
					<div className="relative size-full">
						{coverImageUrl ? (
							<Image
								src={coverImageUrl}
								alt={title}
								fill
								className="object-contain object-left transition-transform duration-300 group-hover:scale-103 lg:object-cover"
								sizes="(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw"
							/>
						) : (
							<div className="flex size-full items-center justify-center">
								<ImageIcon className="text-muted-foreground size-12" />
							</div>
						)}
					</div>
				</div>

				<CardContent className="@container/card-content flex h-full basis-2/3 flex-col px-0 text-pretty lg:px-6">
					{title && (
						<h3 className="text-primary t-heading-6 lg:t-heading-5 xl:t-heading-4 text-pretty">
							{title}
						</h3>
					)}

					{creator && (
						<p className="t-body-3 mt-1 mb-4 lg:mt-2 lg:mb-12">{`By ${creator}`}</p>
					)}

					<div className="mt-auto flex flex-col items-baseline justify-between gap-2 @xs/card-content:flex-row">
						{priceLabel && (
							<p className="t-heading-6 lg:t-heading-5 text-primary font-bold">
								{priceLabel}
							</p>
						)}

						{durationLabel && (
							<p className="t-body-3 text-secondary-foreground">
								{durationLabel}
							</p>
						)}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
