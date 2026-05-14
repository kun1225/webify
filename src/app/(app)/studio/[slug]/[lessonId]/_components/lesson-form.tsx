'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { updateLesson } from '@/services/server/lesson';
import {
	updateLessonFormSchema,
	type UpdateLessonFormData,
} from '@/services/shared/validations';
import { FormButton } from '@/components/form-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEditCourseId } from '../../_components/edit-course-id-provider';

import { LessonFormTitle } from './lesson-form-title';
import { LessonFormVideo } from './lesson-form-video';
import { LessonFormContent } from './lesson-form-content';

import type { FileRejection } from 'react-dropzone';
import type { LessonAndContentForEdit } from '@/types';

const defaultValues: UpdateLessonFormData = {
	title: '',
	videoUrl: '',
	content: {},
};

export function LessonForm({ lesson }: { lesson: LessonAndContentForEdit }) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const router = useRouter();
	const { courseId } = useEditCourseId();

	const form = useForm<UpdateLessonFormData>({
		resolver: zodResolver(updateLessonFormSchema),
		defaultValues: {
			...defaultValues,
			title: lesson.title,
			videoUrl: lesson.videoUrl ?? '',
			content: lesson.content ?? {},
		},
	});

	const onDropVideoRejected = (errors: FileRejection[]) => {
		if (errors.length <= 0) return;

		const errorCode = errors[0]?.errors[0]?.code;

		if (errorCode === 'file-too-large') {
			form.setError('videoUrl', {
				message: '檔案大小限制 50MB',
			});
			return;
		}

		if (errorCode === 'file-invalid-type') {
			form.setError('videoUrl', {
				message: '只支援 MP4、WebM 格式',
			});
			return;
		}

		form.setError('videoUrl', {
			message: '影片上傳失敗，請重新選擇檔案',
		});
	};

	const onDropVideoAccepted = () => {
		form.clearErrors('videoUrl');
	};

	const onRemoveVideo = () => {
		form.setValue('videoUrl', '');
		form.clearErrors('videoUrl');
	};

	const onSubmit = async (data: UpdateLessonFormData) => {
		setIsSubmitting(true);

		const videoUrl =
			typeof data.videoUrl === 'string' &&
			data.videoUrl.startsWith('pending-upload:')
				? ''
				: data.videoUrl;

		const payload = {
			title: data.title,
			videoUrl,
			content: JSON.stringify(data.content ?? {}),
		};

		toast.promise(
			async () => {
				const result = await updateLesson(lesson.id, payload);

				if (!result.ok) {
					throw new Error(result.message);
				}
			},
			{
				loading: '課程單元更新中...',
				success: () => {
					setIsSubmitting(false);
					return '課程單元更新成功';
				},
				error: (err) => {
					console.error('Error updating lesson:', err);
					setIsSubmitting(false);
					return '更新失敗，請稍後再試';
				},
			},
		);
	};

	return (
		<FormProvider {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<Card className="w-full">
					<CardContent className="space-y-6">
						<LessonFormTitle
							field={form.register('title')}
							error={form.formState.errors.title}
						/>

						<Controller
							control={form.control}
							name="videoUrl"
							render={({ field, fieldState }) => (
								<LessonFormVideo
									field={field}
									error={fieldState.error}
									lessonId={lesson.id}
									onDropAccepted={onDropVideoAccepted}
									onDropRejected={onDropVideoRejected}
									onRemoveVideo={onRemoveVideo}
									disabled={isSubmitting}
								/>
							)}
						/>

						<Controller
							control={form.control}
							name="content"
							render={({ field, fieldState }) => (
								<LessonFormContent field={field} error={fieldState.error} />
							)}
						/>

						<div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.push(`/studio/${courseId}`)}
								disabled={isSubmitting}
							>
								取消
							</Button>

							<FormButton
								isLoading={isSubmitting}
								disabled={isSubmitting}
								label="儲存變更"
							/>
						</div>
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
