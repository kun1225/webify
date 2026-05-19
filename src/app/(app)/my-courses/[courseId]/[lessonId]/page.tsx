import { notFound, redirect } from 'next/navigation';

import { AppPageHeader } from '@/app/(app)/_components/app-page-header';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Card, CardContent } from '@/components/ui/card';
import { getLessonAndContentById } from '@/services/server/lesson';
import { AppError } from '@/types';

import { FileText, VideoOff } from 'lucide-react';

import type { JSONContent } from '@tiptap/core';

export default async function LessonPreviewPage({
	params,
}: {
	params: Promise<{ courseId: string; lessonId: string }>;
}) {
	const { lessonId, courseId } = await params;

	const lessonResult = await getLessonAndContentById(lessonId);

	if (!lessonResult.ok) {
		switch (lessonResult.code) {
			case AppError.UNAUTHENTICATED:
				redirect(
					`/auth/login?next=${encodeURIComponent(`/my-courses/${courseId}/${lessonId}`)}`,
				);
			default:
				notFound();
		}
	}

	const { videoUrl, content, title } = lessonResult.data;

	return (
		<>
			<AppPageHeader title={title} />

			<Card className="overflow-hidden py-0">
				<CardContent className="p-0">
					{videoUrl ? (
						<div className="bg-black">
							<video
								src={`/api/lesson-video/${videoUrl}`}
								controls
								className="aspect-video h-full w-full"
							/>
						</div>
					) : (
						<div className="bg-muted text-muted-foreground flex aspect-video w-full flex-col items-center justify-center gap-3">
							<VideoOff className="size-12" />
							<p className="t-body-2">此單元尚未上傳影片</p>
						</div>
					)}
				</CardContent>
			</Card>

			<h2 className="t-heading-4 text-foreground">課程內容</h2>

			<Card>
				<CardContent className="space-y-4">
					{content ? (
						<RichTextEditor
							value={content as JSONContent}
							showToolbar={false}
							isViewMode
						/>
					) : (
						<div className="text-muted-foreground flex items-center gap-3">
							<FileText className="size-5" />
							<p className="t-body-2">此單元尚未提供課程內文</p>
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
}
