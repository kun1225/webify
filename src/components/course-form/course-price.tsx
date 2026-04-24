import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import type {
	FieldError as RhfFieldError,
	UseFormRegisterReturn,
} from 'react-hook-form';

export function CoursePrice({
	field,
	error,
}: {
	field: UseFormRegisterReturn<'price'>;
	error?: RhfFieldError;
}) {
	return (
		<Field data-invalid={!!error}>
			<FieldLabel htmlFor="price">課程價格</FieldLabel>
			<Input
				id="price"
				type="number"
				min={0}
				step="1"
				inputMode="numeric"
				placeholder="0"
				aria-invalid={!!error}
				{...field}
			/>
			<FieldDescription>設置為 0 表示免費課程</FieldDescription>
			<FieldError errors={[error]} />
		</Field>
	);
}
