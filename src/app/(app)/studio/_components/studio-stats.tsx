import { Card, CardContent } from '@/components/ui/card';

import { CourseForStudio } from '@/types';

export function StudioStats({ data }: { data: CourseForStudio[] }) {
	const stats = [
		{
			label: '總課程數',
			value: data.length,
		},
		{
			label: '總收入',
			value: data.reduce(
				(acc, course) => acc + (course.purchases ?? 0) * (course.price ?? 0),
				0,
			),
		},
		{
			label: '總付款數',
			value: data.reduce((acc, course) => acc + (course.purchases ?? 0), 0),
		},
	];

	return (
		<section className="flex flex-wrap gap-4 *:flex-1">
			{stats.map((stat) => (
				<StudioStatsItem
					key={stat.label}
					value={stat.value}
					label={stat.label}
				/>
			))}
		</section>
	);
}

function StudioStatsItem({ label, value }: { label: string; value: number }) {
	return (
		<Card>
			<CardContent>
				<p className="t-body-2 text-muted-foreground whitespace-nowrap">
					{label}
				</p>
				<p className="t-body-1 font-bold">{value}</p>
			</CardContent>
		</Card>
	);
}
