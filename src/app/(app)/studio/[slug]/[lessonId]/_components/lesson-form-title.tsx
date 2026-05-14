import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

import type {
	FieldError as RhfFieldError,
	UseFormRegisterReturn,
} from 'react-hook-form';

export function LessonFormTitle({
	field,
	error,
}: {
	field: UseFormRegisterReturn<'title'>;
	error?: RhfFieldError;
}) {
	return (
		<Field data-invalid={!!error}>
			<FieldLabel htmlFor="title">單元標題</FieldLabel>
			<Input
				id="title"
				placeholder="請輸入單元標題"
				aria-invalid={!!error}
				{...field}
			/>
			<FieldError errors={[error]} />
		</Field>
	);
}
