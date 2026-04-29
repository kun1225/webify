'use client';

import { useState, type ComponentProps } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { insertLesson } from '@/services/server/lesson';

import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogClose,
	DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { FormButton } from '@/components/form-button';
import { useEditCourseId } from '@/app/(app)/studio/[slug]/_components/edit-course-id-provider';

import {
	upsertLessonTitleFormSchema,
	type UpsertLessonTitleFormData,
} from '@/services/shared/validations';

export function EditCourseLessonsDialog({
	children,
	triggerSize,
}: {
	children: React.ReactNode;
	triggerSize?: ComponentProps<typeof Button>['size'];
}) {
	const { courseId } = useEditCourseId();

	const [isOpen, setIsOpen] = useState(false);

	const form = useForm<UpsertLessonTitleFormData>({
		resolver: zodResolver(upsertLessonTitleFormSchema),
		defaultValues: {
			title: '',
		},
	});

	const onSubmit = async (data: UpsertLessonTitleFormData) => {
		toast.promise(
			async () => {
				const res = await insertLesson(data, courseId!);

				if (!res.ok) {
					throw new Error(res.message);
				}
			},
			{
				loading: '單元名稱更新中...',
				success: () => {
					// router.refresh() will not work sometimes
					window.location.reload();
					return '單元名稱更新成功';
				},
				error: (err: Error) => {
					return err.message || '單元名稱更新失敗';
				},
			},
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button size={triggerSize}>{children}</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>單元名稱</DialogTitle>
				</DialogHeader>

				<DialogDescription className="sr-only">
					請輸入單元名稱，以便學習者更容易理解課程內容。
				</DialogDescription>

				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Controller
							control={form.control}
							name="title"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>單元名稱</FieldLabel>
									<Input
										{...field}
										id={field.name}
										placeholder="請輸入單元名稱"
										aria-invalid={fieldState.invalid}
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					</FieldGroup>

					<footer className="mt-4 flex justify-end gap-4">
						<DialogClose asChild>
							<Button variant="outline">取消</Button>
						</DialogClose>

						<FormButton
							type="submit"
							isLoading={form.formState.isSubmitting}
							label="建立單元"
						/>
					</footer>
				</form>
			</DialogContent>
		</Dialog>
	);
}
