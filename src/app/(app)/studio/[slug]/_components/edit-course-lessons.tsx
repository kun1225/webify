import { hasArrayValue } from '@/lib/utils';

import { BookmarkCheck, PlusCircle } from 'lucide-react';
import { AppPageHeader } from '@/app/(app)/_components/app-page-header';
import { Card, CardContent } from '@/components/ui/card';

import { EditCourseLessonsList } from './edit-course-lessons-list';
import { EditCourseLessonsDialog } from './edit-course-lessons-dialog';

import type { LessonAndContentForEdit } from '@/types';
import { EmptyCard } from '@/components/empty-card';

export function EditCourseLessons({
	lessons,
}: {
	lessons: LessonAndContentForEdit[];
}) {
	const isEmpty = !hasArrayValue(lessons);

	return (
		<section className="space-y-6">
			<div className="flex items-end justify-between">
				<AppPageHeader
					title="編輯課程單元"
					description="編輯您的課程單元，包括標題、影片和內容"
				/>

				<EditCourseLessonsDialog>建立單元</EditCourseLessonsDialog>
			</div>

			{isEmpty ? (
				<EmptyCard
					title="創建課程單元"
					description="創建課程單元，讓學習者更容易理解課程內容。"
					iconComponent={<BookmarkCheck className="size-13" />}
					actionComponent={
						<EditCourseLessonsDialog triggerSize="lg">
							<PlusCircle />
							建立課程單元
						</EditCourseLessonsDialog>
					}
				/>
			) : (
				<Card>
					<CardContent>
						<EditCourseLessonsList lessons={lessons} />
					</CardContent>
				</Card>
			)}
		</section>
	);
}
