import { Input } from '@/components/ui/input';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';

import type { FieldError as RhfFieldError, UseFormRegisterReturn } from 'react-hook-form';

export function CourseTitle({
	field,
	error,
}: {
	field: UseFormRegisterReturn<'title'>;
	error?: RhfFieldError;
}) {
	return (
		<Field data-invalid={!!error}>
			<FieldLabel htmlFor="title">課程標題</FieldLabel>
			<Input
				id="title"
				placeholder="請輸入吸引人的課程標題（最多30個字）"
				aria-invalid={!!error}
				{...field}
			/>
			<FieldDescription>
				建議使用簡潔明瞭的標題，突出課程的核心價值
			</FieldDescription>
			<FieldError errors={[error]} />
		</Field>
	);
}
