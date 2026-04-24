import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import { cn } from '@/lib/utils';

import type {
	FieldError as RhfFieldError,
	UseFormRegisterReturn,
} from 'react-hook-form';
import { useFormContext as useRhfFormContext } from 'react-hook-form';
import type { UpsertCourseFormData } from '@/services/shared/validations';

export function CourseDescription({
	field,
	error,
}: {
	field: UseFormRegisterReturn<'description'>;
	error?: RhfFieldError;
}) {
	const { watch } = useRhfFormContext<UpsertCourseFormData>();
	const wordCount = String(watch('description') ?? '').trim().length;

	return (
		<Field data-invalid={!!error}>
			<FieldLabel htmlFor="description">課程描述</FieldLabel>
			<textarea
				id="description"
				className={cn(
					'border-input bg-background placeholder:text-muted-foreground min-h-40 w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
					'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
					'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
				)}
				aria-invalid={!!error}
				placeholder="請詳細描述您的課程內容、學習目標和適合的學員群體..."
				{...field}
			/>
			<div className="text-muted-foreground t-body-3 flex justify-between">
				<FieldDescription>建議至少 10 個字，最多 2000 個字</FieldDescription>
				<span
					className={cn(
						wordCount > 2000
							? 'text-destructive font-medium'
							: wordCount > 1500 && 'text-destructive/80',
					)}
				>
					{wordCount}/2000
				</span>
			</div>
			<FieldError errors={[error]} />
		</Field>
	);
}
