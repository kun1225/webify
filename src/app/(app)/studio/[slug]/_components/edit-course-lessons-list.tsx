'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import type { DragEndEvent } from '@dnd-kit/react';

import { updateLessonsOrder } from '@/services/server/lesson';
import { cn } from '@/lib/utils';
import { useEditCourseId } from '@/app/(app)/studio/[slug]/_components/edit-course-id-provider';

import { GripVertical, Video, VideoOff } from 'lucide-react';

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import type { LessonAndContentForEdit } from '@/types';

export function EditCourseLessonsList({
	lessons: initialLessons,
}: {
	lessons: LessonAndContentForEdit[];
}) {
	const { courseId } = useEditCourseId();

	const [lessons, setLessons] = useState(initialLessons);
	const [isUpdating, setIsUpdating] = useState(false);

	const handleDragEnd = async (event: DragEndEvent) => {
		if (event.canceled) return;

		const { source } = event.operation;
		if (!isSortable(source)) return;

		const { initialIndex, index } = source;
		if (initialIndex === index) return;

		const newLessons = [...lessons];
		const [removedLesson] = newLessons.splice(initialIndex, 1);
		if (!removedLesson) return;
		newLessons.splice(index, 0, removedLesson);
		setLessons(newLessons);

		if (!courseId) {
			console.error('Course ID is missing');
			return;
		}

		setIsUpdating(true);
		const result = await updateLessonsOrder(
			courseId,
			newLessons.map((l) => l.id),
		);
		setIsUpdating(false);

		if (!result.ok) {
			console.error('更新順序失敗:', result.message);
		}
	};

	return (
		<DragDropProvider onDragEnd={handleDragEnd}>
			<div className="space-y-2">
				{lessons.map((lesson, index) => (
					<EditCourseLessonItem
						key={lesson.id}
						lesson={lesson}
						index={index}
						isUpdating={isUpdating}
					/>
				))}
			</div>
		</DragDropProvider>
	);
}

function EditCourseLessonItem({
	lesson,
	index,
	isUpdating,
}: {
	lesson: LessonAndContentForEdit;
	index: number;
	isUpdating: boolean;
}) {
	const { courseId } = useEditCourseId();

	const { handleRef, ref, isDragSource } = useSortable({
		id: lesson.id,
		index,
		disabled: isUpdating,
	});

	return (
		<div
			ref={ref}
			className={cn(
				'bg-muted relative rounded-lg transition-opacity duration-300 hover:shadow-sm',
				isDragSource && 'opacity-50',
			)}
		>
			<div
				className={cn(
					'flex items-center transition-all duration-200',
					isDragSource && 'cursor-grabbing',
					!isDragSource && 'hover:bg-muted/50',
				)}
			>
				<button
					ref={handleRef}
					type="button"
					aria-label="拖曳排序課程單元"
					disabled={isUpdating}
					className={cn(
						'text-muted-foreground hover:text-foreground cursor-grab touch-none px-4 py-6 transition-colors duration-200 active:cursor-grabbing',
						isDragSource && 'text-primary',
						isUpdating && 'cursor-not-allowed opacity-50',
					)}
				>
					<GripVertical className="size-4" />
				</button>

				<Link
					className={cn(
						't-body-2 flex flex-1 justify-between gap-2 px-4 py-6 font-semibold',
						isDragSource && 'text-primary',
					)}
					href={`/studio/${courseId}/${lesson.id}`}
				>
					<span>{lesson.title}</span>
					<Tooltip>
						<TooltipTrigger asChild>
							{lesson.videoUrl ? (
								<Video className="text-primary size-5" />
							) : (
								<VideoOff className="text-muted-foreground size-5" />
							)}
						</TooltipTrigger>
						<TooltipContent>
							{lesson.videoUrl ? '已上傳影片' : '尚未上傳影片'}
						</TooltipContent>
					</Tooltip>
				</Link>
			</div>
		</div>
	);
}
