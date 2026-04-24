import { Fragment } from 'react';

import { Separator } from '@/components/ui/separator';

import { CoursesCard } from './courses-card';
import { CoursesFilter } from './courses-filter';
import { CoursesPagination } from './courses-pagination';
import { CoursesSidebar } from './courses-sidebar';
import { CoursesSort } from './courses-sort';

import type { CoursesWithPagination } from '@/types/course';

async function getCoursesWithFilters(): Promise<CoursesWithPagination> {
	// 模擬 API 延遲
	await new Promise((resolve) => setTimeout(resolve, 300));

	return {
		courses: [
			{
				id: '1',
				title: 'Course 1',
				slug: 'course-1',
				coverImageUrl: '',
				price: 0,
				creator: 'ThisWeb',
				duration: 0,
			},
		],
		pagination: {
			total: 1,
			totalPages: 1,
		},
		hasMore: false,
	};
}

export async function CoursesMain() {
	const data = await getCoursesWithFilters();

	// Get totalPages from data if available, otherwise default to 0
	const totalPages = data?.pagination?.totalPages ?? 0;
	const totalCourses = data?.pagination?.total ?? 0;

	return (
		<div className="space-y-8 lg:flex lg:gap-16 lg:space-y-0">
			<CoursesSidebar className="hidden lg:block" />

			<div className="grow space-y-8">
				<div className="border-border flex items-end justify-between border-b pb-6">
					<p className="t-body-2 text-muted-foreground">
						共 {totalCourses} 堂課程
					</p>

					<div className="flex items-center gap-4">
						<CoursesFilter className="lg:hidden" />

						<CoursesSort />
					</div>
				</div>

				<div className="grid grid-cols-1 gap-1 lg:grid-cols-3 lg:gap-8">
					{data.courses.map((course) => (
						<Fragment key={course.id}>
							<CoursesCard data={course} />
							<Separator className="lg:hidden" />
						</Fragment>
					))}
				</div>

				<CoursesPagination totalPages={totalPages} />
			</div>
		</div>
	);
}
