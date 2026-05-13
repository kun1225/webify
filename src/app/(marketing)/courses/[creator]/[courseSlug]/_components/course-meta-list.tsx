import { CourseForCourseDetail } from '@/types';
import { Timer, Flag, ShoppingCart, List } from 'lucide-react';

export function CourseMetaList({ data }: { data: CourseForCourseDetail }) {
	const { duration, purchases, lessons, updatedAt } = data;

	const formattedUpdatedAt = new Date(updatedAt ?? '').toLocaleDateString(
		'zh-TW',
		{
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		},
	);

	const metaItems = [
		{
			icon: Flag,
			label: '時長',
			value: `${duration} 小時`,
		},
		{
			icon: Timer,
			label: '最新更新',
			value: formattedUpdatedAt,
		},
		{
			icon: ShoppingCart,
			label: '購買人數',
			value: purchases?.toString() ?? '0',
		},
		{
			icon: List,
			label: '課程章節',
			value: lessons.length.toString(),
		},
	];

	return (
		<ul className="t-body-2 grid grid-cols-1 gap-4 md:grid-cols-2">
			{metaItems.map((item) => (
				<CourseMetaItem key={item.label} {...item} />
			))}
		</ul>
	);
}

function CourseMetaItem({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ElementType;
	label: string;
	value: string;
}) {
	return (
		<li className="flex items-center gap-4">
			<Icon className="bg-primary size-11 rounded-lg p-3 text-white" />
			<span>{`${label}: ${value}`}</span>
		</li>
	);
}
