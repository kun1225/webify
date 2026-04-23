import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, ImageIcon, PlusCircle } from 'lucide-react';

import { EmptyCard } from '@/components/empty-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { hasArrayValue } from '@/lib/utils';
import type { CourseForStudio } from '@/types';

export function StudioCourses({ data }: { data: CourseForStudio[] }) {
	const isEmpty = !hasArrayValue(data);

	return isEmpty ? (
		<EmptyCard
			title="開始建立你的第一門課程"
			description="分享你的專業知識，建立線上課程來幫助更多人學習。從建立第一門課程開始你的教學之旅。"
			iconComponent={<BookOpen className="size-13" />}
			actionComponent={
				<Button asChild size="lg" className="mt-4">
					<Link href="/studio/new-course">
						<PlusCircle />
						建立新課程
					</Link>
				</Button>
			}
		/>
	) : (
		<section className="grid grid-cols-1 gap-6 @md/main:grid-cols-2 @xl/main:grid-cols-3">
			{data.map((course) => (
				<StudioCourseCard key={course.id} course={course} />
			))}
		</section>
	);
}

function StudioCourseCard({ course }: { course: Partial<CourseForStudio> }) {
	const { coverImageUrl, title, price, isHidden } = course;

	if (!course.id) return null;

	const courseUrl = `/studio/${course.id}`;
	const courseTitle = title || '未命名課程';
	const priceLabel = formatPrice(price);
	const purchasesLabel = course.purchases ?? 0;
	const statusLabel = getStatusLabel({ isHidden });
	const statusVariant = isHidden ? 'secondary' : 'outline';

	return (
		<Link href={courseUrl as Route}>
			<Card className="group h-full pt-0 shadow-sm transition-shadow duration-300 hover:shadow-md">
				<div className="bg-muted aspect-video w-full overflow-hidden">
					<div className="relative size-full transition-transform duration-300 group-hover:scale-105">
						{coverImageUrl ? (
							<Image
								src={coverImageUrl}
								alt={courseTitle}
								fill
								className="object-cover transition-transform duration-300 group-hover:scale-102"
								sizes="(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw"
							/>
						) : (
							<div className="flex size-full items-center justify-center">
								<ImageIcon className="text-muted-foreground size-12" />
							</div>
						)}
					</div>
				</div>

				<CardContent className="flex grow flex-col gap-8">
					<header className="flex flex-wrap items-center justify-between">
						<h3 className="t-body-1 text-foreground line-clamp-2 font-semibold">
							{courseTitle}
						</h3>
						<Badge className="whitespace-nowrap" variant={statusVariant}>
							{statusLabel}
						</Badge>
					</header>

					<div className="t-body-3 mt-auto space-y-2">
						<div className="text-muted-foreground flex items-center justify-between">
							<span>價格</span>
							<span className="text-foreground font-semibold">
								{priceLabel}
							</span>
						</div>
						<div className="text-muted-foreground flex items-center justify-between">
							<span>購買數</span>
							<span className="text-foreground font-semibold">
								{purchasesLabel}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}

const currencyFormatter = new Intl.NumberFormat('zh-TW', {
	style: 'currency',
	currency: 'TWD',
	maximumFractionDigits: 0,
});

function formatPrice(price?: number | null) {
	if (typeof price !== 'number') {
		return '未設定';
	}

	if (price === 0) {
		return '免費';
	}

	return currencyFormatter.format(price);
}

function getStatusLabel({ isHidden }: { isHidden?: boolean | null }) {
	if (isHidden) {
		return '未公開';
	}

	return '已上架';
}
