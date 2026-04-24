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

export function CourseDuration({
	field,
	error,
}: {
	field: UseFormRegisterReturn<'duration'>;
	error?: RhfFieldError;
}) {
	return (
		<Field data-invalid={!!error}>
			<FieldLabel htmlFor="duration">課程時長</FieldLabel>
			<Input
				id="duration"
				type="number"
				min={0}
				step="0.5"
				inputMode="decimal"
				placeholder="0"
				aria-invalid={!!error}
				{...field}
			/>
			<FieldDescription>
				大約需要多少時間完成課程，設置 1.5 表示 1.5 小時
			</FieldDescription>
			<FieldError errors={[error]} />
		</Field>
	);
}
