import Image from 'next/image';

import { BookOpen, CalendarCheck, Clock } from 'lucide-react';

import { Card } from '@/components/ui/card';

import type { CourseForCourseDetail } from '@/types';

export function CourseHero({ data }: { data: CourseForCourseDetail }) {
	const { title, coverImageUrl, creator } = data;

	return (
		<Card className="gap-0 overflow-hidden py-0">
			<div className="bg-muted relative min-h-[480px] after:absolute after:inset-0 after:bg-black/60 after:backdrop-blur-sm">
				{coverImageUrl ? (
					<Image
						src={coverImageUrl}
						alt={title}
						fill
						className="object-cover"
						priority
					/>
				) : (
					<div className="text-muted-foreground flex h-full items-center justify-center">
						<BookOpen className="size-16" />
					</div>
				)}

				<div className="from-background/40 absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t to-transparent p-8 text-white">
					{creator && <p className="t-body-1">{`講師：${creator}`}</p>}

					{title && (
						<h1 className="t-heading-1 mt-2 text-ellipsis drop-shadow">
							{title}
						</h1>
					)}
				</div>
			</div>

			<CourseHeroMeta data={data} />
		</Card>
	);
}

function CourseHeroMeta({ data }: { data: CourseForCourseDetail }) {
	const { lessons, duration, updatedAt } = data;

	return (
		<section className="bg-muted text-muted-foreground flex w-full flex-wrap gap-4 px-4 py-6">
			<div className="flex grow items-center gap-4">
				<BookOpen className="text-primary size-6" />
				<div>
					<p className="t-body-3">課程單元</p>
					<p className="t-body-2 md:t-body-1 text-foreground font-semibold">
						{lessons?.length ?? 0} 節
					</p>
				</div>
			</div>

			<div className="flex grow items-center gap-4">
				<Clock className="text-primary size-6" />
				<div>
					<p className="t-body-3">預估時數</p>
					<p className="t-body-2 md:t-body-1 text-foreground font-semibold">
						{formatDuration(duration)}
					</p>
				</div>
			</div>

			<div className="flex grow items-center gap-4">
				<CalendarCheck className="text-primary size-6" />
				<div>
					<p className="t-body-3">最後更新</p>
					<p className="t-body-2 md:t-body-1 text-foreground font-semibold">
						{formatUpdatedAt(updatedAt)}
					</p>
				</div>
			</div>
		</section>
	);
}

function formatDuration(duration?: number | null) {
	if (!duration || duration <= 0) return '未提供';
	if (duration < 1) {
		const minutes = Math.round(duration * 60);
		return `${minutes} 分鐘`;
	}
	return `${duration} 小時`;
}

function formatUpdatedAt(updatedAt?: string | null) {
	if (!updatedAt) return '未提供';
	const date = new Date(updatedAt);
	if (Number.isNaN(date.getTime())) return '未提供';
	return new Intl.DateTimeFormat('zh-TW', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	}).format(date);
}
