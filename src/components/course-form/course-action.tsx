'use client';

import { FormButton } from '@/components/form-button';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';

import { type UpsertCourseFormData } from '@/services/shared/validations';

export function CourseAction({
	isEditing,
	isSubmitting,
	onCancel,
}: {
	isEditing: boolean;
	isSubmitting: boolean;
	onCancel: () => void;
}) {
	const form = useFormContext<UpsertCourseFormData>();

	const primaryButtonLabel = isEditing ? '更新課程' : '發佈課程';

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
			<Button
				type="button"
				variant="outline"
				onClick={() => {
					form.reset();
					onCancel();
				}}
				disabled={isSubmitting}
			>
				取消
			</Button>

			<FormButton
				isLoading={isSubmitting}
				disabled={isSubmitting}
				label={primaryButtonLabel}
			/>
		</div>
	);
}
