'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { sortOptions } from '../_utils/courses-helpers';

import type { CoursesSortOption } from '@/types';

export function CoursesSort() {
	const currentSortOption = 'popular';

	const handleSortChange = (value: CoursesSortOption) => {
		// TODO: Implement sort change
	};

	return (
		<div className="flex items-center gap-2">
			<label
				htmlFor="sort-filter"
				className="t-body-2 text-muted-foreground hidden sm:inline-block"
			>
				排序：
			</label>

			<Select value={currentSortOption} onValueChange={handleSortChange}>
				<SelectTrigger id="sort-filter" className="w-[156px]">
					<SelectValue />
				</SelectTrigger>

				<SelectContent>
					{sortOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
