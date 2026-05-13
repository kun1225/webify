'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { priceFilterOptions } from '../_utils/courses-helpers';

import type { CoursesPriceFilterOption } from '@/types';
import { cn } from '@/lib/utils';

export function CoursesFilter({ className }: { className?: string }) {
	const currentPriceFilter = 'all';

	const handlePriceFilterChange = (value: CoursesPriceFilterOption) => {
		// TODO: Implement price filter change
	};

	return (
		<div className={cn('flex items-center gap-2', className)}>
			<label
				htmlFor="price-filter"
				className="t-body-2 text-muted-foreground hidden sm:inline-block"
			>
				價格：
			</label>

			<Select
				value={currentPriceFilter}
				onValueChange={handlePriceFilterChange}
			>
				<SelectTrigger id="price-filter" size="default" className="w-30">
					<SelectValue />
				</SelectTrigger>

				<SelectContent position="item-aligned">
					{priceFilterOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
