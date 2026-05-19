import Image from 'next/image';
import Link from 'next/link';

import { EyeOff, ImageIcon, Plus, ShoppingBag } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getPurchasedCourses } from '@/services/server/courses';
import { EmptyCard } from '@/components/empty-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { AppPageHeader } from '../_components/app-page-header';

import type { CourseForPurchased } from '@/types';

export default async function Page() {
	const purchasedCourses = await getPurchasedCourses();

	if (!purchasedCourses.ok) {
		throw new Error(purchasedCourses.message);
	}

	const courses = purchasedCourses.data;
	const hasCourses = courses.length > 0;

	return (
		<section className="px-edge space-y-6 py-6">
			<AppPageHeader title="我的課程" description="你購買的所有課程" />

			{hasCourses ? (
				<div className="mt-8 grid grid-cols-1 gap-8 @lg/main:grid-cols-2 @2xl/main:grid-cols-3 @6xl/main:grid-cols-4">
					{courses.map((course) => (
						<MyCoursesCard key={course.id} data={course} />
					))}
				</div>
			) : (
				<EmptyCard
					title="你還沒有購買任何課程"
					description="前往課程列表探索並購買你的第一門課程。"
					iconComponent={<ShoppingBag className="size-13" />}
					actionComponent={
						<Button asChild>
							<Link href="/courses">
								<span>探索課程</span>
								<Plus />
							</Link>
						</Button>
					}
				/>
			)}
		</section>
	);
}

function MyCoursesCard({ data }: { data: CourseForPurchased }) {
	const { title, duration, creator, isHidden } = data;

	const durationLabel =
		duration && duration > 0 ? `課程約 ${duration} 小時` : '無課程時長';

	return (
		<Card
			className={cn(
				'relative overflow-hidden pt-0 transition-shadow duration-300',
				isHidden ? 'cursor-not-allowed' : 'group hover:shadow-md',
			)}
		>
			<div className={cn('h-full', isHidden && 'opacity-40 grayscale')}>
				<div className="relative aspect-video w-full">
					{data.coverImageUrl ? (
						<Image
							src={data.coverImageUrl || ''}
							alt={title || 'Course Cover Image'}
							fill
							className="transition-transform duration-300 group-hover:scale-102"
						/>
					) : (
						<div className="bg-muted/50 flex size-full items-center justify-center">
							<ImageIcon className="text-muted-foreground size-12" />
						</div>
					)}
				</div>

				<CardContent className="pt-6">
					{title && <p className="t-heading-4 text-primary">{title}</p>}
					{creator && <p className="t-body-3 mt-8">{creator}</p>}
					{durationLabel && <p className="t-body-4">{durationLabel}</p>}
				</CardContent>
			</div>

			{!isHidden ? (
				<Link
					className="absolute inset-0 z-10"
					href={`/my-courses/${data.id}`}
				/>
			) : (
				<div className="absolute inset-0 z-10 flex items-center justify-center">
					<Badge
						variant="outline"
						className="text-muted-foreground t-body-3 bg-background/80 shadow-sm backdrop-blur-xs"
					>
						<EyeOff />
						創作者已將課程隱藏
					</Badge>
				</div>
			)}
		</Card>
	);
}
