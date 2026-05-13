import { Fragment } from 'react';
import { BookOpen } from 'lucide-react';

import { EmptyCard } from '@/components/empty-card';
import { Separator } from '@/components/ui/separator';
import { getCoursesWithFilters } from '@/services/server/courses';

import { CoursesCard } from './courses-card';
import { CoursesFilter } from './courses-filter';
import { CoursesPagination } from './courses-pagination';
import { CoursesSidebar } from './courses-sidebar';
import { CoursesSort } from './courses-sort';

export async function CoursesMain() {
	const result = await getCoursesWithFilters();

	if (!result.ok) {
		return (
			<EmptyCard
				title="課程載入失敗"
				description={result.message}
				iconComponent={<BookOpen />}
				actionComponent={null}
				className="border-none bg-transparent py-26"
			/>
		);
	}

	const data = result.data;
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

				{data.courses.length > 0 ? (
					<div className="grid grid-cols-1 gap-1 lg:grid-cols-3 lg:gap-8">
						{data.courses.map((course) => (
							<Fragment key={course.id}>
								<CoursesCard data={course} />
								<Separator className="lg:hidden" />
							</Fragment>
						))}
					</div>
				) : (
					<EmptyCard
						title="找不到符合條件的課程"
						description="試試調整篩選條件或排序方式"
						iconComponent={<BookOpen />}
						actionComponent={null}
						className="border-none bg-transparent py-26"
					/>
				)}

				<CoursesPagination totalPages={totalPages} />
			</div>
		</div>
	);
}
