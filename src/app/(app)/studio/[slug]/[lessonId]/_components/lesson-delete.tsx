'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { deleteLesson } from '@/services/server/lesson';
import { useEditCourseId } from '../../_components/edit-course-id-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

import type { LessonAndContentForEdit } from '@/types';

export function LessonDelete({ data }: { data: LessonAndContentForEdit }) {
	const { courseId } = useEditCourseId();
	const [isDeleting, setIsDeleting] = useState(false);

	const router = useRouter();

	const handleDelete = async () => {
		setIsDeleting(true);

		toast.promise(
			async () => {
				const result = await deleteLesson(data.id);

				if (!result.ok) {
					throw new Error(result.message);
				}
			},
			{
				loading: '刪除課程單元中...',
				success: () => {
					setTimeout(() => {
						router.push(`/studio/${courseId}`);
					}, 0);
					return '刪除課程單元成功';
				},
				error: (err) => {
					setIsDeleting(false);
					return err.message || '刪除課程單元失敗';
				},
			},
		);
	};

	return (
		<Card className="border-destructive bg-destructive-background">
			<CardContent className="space-y-4">
				<p className="t-body-2">
					<span className="mr-1 font-bold">注意：</span>
					刪除課程單元將會刪除此單元的所有資料，且無法復原。
				</p>

				<Dialog>
					<DialogTrigger asChild>
						<Button variant="destructive">刪除課程單元</Button>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>確認刪除課程單元</DialogTitle>
							<DialogDescription className="t-body-3 my-4">
								您確定要刪除這個課程單元嗎？此操作無法復原，將會永久刪除
							</DialogDescription>
						</DialogHeader>

						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline" disabled={isDeleting}>
									取消
								</Button>
							</DialogClose>
							<Button
								variant="destructive"
								onClick={handleDelete}
								disabled={isDeleting}
							>
								{isDeleting ? '刪除中...' : '確認刪除'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	);
}
