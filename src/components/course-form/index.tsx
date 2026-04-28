'use client';

import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Controller,
	FormProvider,
	type ControllerRenderProps,
	useForm,
} from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { upsertCourse } from '@/services/server/course';
import {
	upsertCourseFormSchema,
	type UpsertCourseFormData,
} from '@/services/shared/validations';
import { hasValueObject } from '@/lib/utils';

import { Card, CardContent } from '@/components/ui/card';
import { CourseCoverUploader } from './course-cover-uploader';
import { CourseTitle } from './course-title';
import { CourseSlug } from './course-slug';
import { CoursePrice } from './course-price';
import { CourseDuration } from './course-duration';
import { CourseVisibility } from './course-visibility';
import { CourseAction } from './course-action';
import { CourseDescription } from './course-description';

import type { UserProfile, CourseForEdit } from '@/types';

export type CourseFormField<T extends keyof UpsertCourseFormData> =
	ControllerRenderProps<UpsertCourseFormData, T>;

const defaultValues: UpsertCourseFormData = {
	title: '',
	slug: '',
	description: '',
	price: 0,
	duration: 0,
	coverImageUrl: '',
	isHidden: false,
};

export function CourseForm({
	user,
	initData,
}: {
	user: UserProfile;
	initData?: CourseForEdit;
}) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEditingExistingCourse = hasValueObject(initData);

	const defaultFormValues = {
		...defaultValues,
		...initData,
	} as UpsertCourseFormData;

	const form = useForm<UpsertCourseFormData>({
		resolver: zodResolver(upsertCourseFormSchema),
		defaultValues: defaultFormValues,
	});

	const handleCancel = useCallback(() => {
		router.push('/studio');
	}, [router]);

	const onSubmit = async (data: UpsertCourseFormData) => {
		setIsSubmitting(true);

		toast.promise(
			async () => {
				const res = await upsertCourse(data, initData?.id);

				if (!res.ok) {
					throw new Error(res.message);
				}
			},
			{
				loading: isEditingExistingCourse ? '更新課程中...' : '創建課程中...',
				success: () => {
					if (!isEditingExistingCourse) {
						router.push('/studio');
					}

					setIsSubmitting(false);
					return isEditingExistingCourse ? '課程更新成功！' : '課程創建成功！';
				},
				error: (err) => {
					console.error('創建課程失敗', err);
					setIsSubmitting(false);
					return isEditingExistingCourse
						? '課程更新失敗，請稍後再試'
						: '課程創建失敗，請稍後再試';
				},
			},
		);
	};

	return (
		<FormProvider {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<Card>
					<CardContent className="space-y-8">
						<CourseTitle
							field={form.register('title')}
							error={form.formState.errors.title}
						/>

						<CourseSlug
							field={form.register('slug')}
							error={form.formState.errors.slug}
							user={user}
						/>

						<Controller
							control={form.control}
							name="coverImageUrl"
							render={({ field, fieldState }) => (
								<CourseCoverUploader field={field} error={fieldState.error} />
							)}
						/>

						<CourseDescription
							field={form.register('description')}
							error={form.formState.errors.description}
						/>

						<div className="grid gap-6 @md/main:grid-cols-2">
							<CoursePrice
								field={form.register('price', {
									setValueAs: (value) => (value === '' ? 0 : Number(value)),
								})}
								error={form.formState.errors.price}
							/>

							<CourseDuration
								field={form.register('duration', {
									setValueAs: (value) => (value === '' ? 0 : Number(value)),
								})}
								error={form.formState.errors.duration}
							/>
						</div>

						<Controller
							control={form.control}
							name="isHidden"
							render={({ field, fieldState }) => (
								<CourseVisibility field={field} error={fieldState.error} />
							)}
						/>

						<CourseAction
							isEditing={isEditingExistingCourse}
							isSubmitting={isSubmitting}
							onCancel={handleCancel}
						/>
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
