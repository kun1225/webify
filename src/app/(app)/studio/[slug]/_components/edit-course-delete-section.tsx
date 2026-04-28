'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCourse } from '@/services/server/course';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

import { useEditCourseId } from '@/app/(app)/studio/[slug]/_components/edit-course-id-provider';

export function EditCourseDeleteSection() {
	const { courseId } = useEditCourseId();

	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const [confirmationText, setConfirmationText] = useState('');
	const router = useRouter();

	const isConfirmationValid = confirmationText === '刪除';

	const handleDelete = async () => {
		if (!courseId || !isConfirmationValid) return;

		setIsDeleting(true);

		toast.promise(
			async () => {
				const result = await deleteCourse(courseId);

				if (!result.ok) {
					throw new Error(result.message);
				}
			},
			{
				loading: '刪除課程中...',
				success: () => {
					setTimeout(() => {
						router.push('/studio');
					}, 0);

					return '刪除課程成功';
				},
				error: (error: Error) => {
					console.error('Delete error:', error);
					return '刪除失敗，請稍後再試';
				},
			},
		);
	};

	const handleDialogClose = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			setConfirmationText('');
		}
	};

	return (
		<Card className="border-destructive bg-destructive-background">
			<CardContent className="space-y-4">
				<p className="t-body-2">
					<span className="mr-1 font-bold">注意：</span>
					刪除課程將會刪除課程的所有資料，且無法復原。
				</p>

				<Dialog open={isOpen} onOpenChange={handleDialogClose}>
					<DialogTrigger asChild>
						<Button variant="destructive" className="">
							刪除課程
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>確認刪除課程</DialogTitle>

							<div className="t-body-3 text-secondary-foreground my-4">
								<p>您確定要刪除這個課程嗎？此操作無法復原，將會永久刪除：</p>
								<ul className="my-3 list-inside list-disc">
									<li>課程的所有資料</li>
									<li>課程的所有章節和影片</li>
									<li>學員的學習進度記錄</li>
								</ul>
								<p>請在下方輸入框中輸入「刪除」來確認此操作。</p>
							</div>

							<label
								htmlFor="confirmation-input"
								className="t-body-3 font-medium"
							>
								確認文字
							</label>
							<Input
								id="confirmation-input"
								type="text"
								placeholder="請輸入「刪除」"
								value={confirmationText}
								onChange={(e) => setConfirmationText(e.target.value)}
								className="w-full"
							/>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => handleDialogClose(false)}
								disabled={isDeleting}
							>
								取消
							</Button>
							<Button
								variant="destructive"
								onClick={handleDelete}
								disabled={isDeleting || !isConfirmationValid}
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
