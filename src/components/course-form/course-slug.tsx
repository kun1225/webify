import { Input } from '@/components/ui/input';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';

import type {
	FieldError as RhfFieldError,
	UseFormRegisterReturn,
} from 'react-hook-form';
import type { UserProfile } from '@/types/user';

export function CourseSlug({
	field,
	error,
	user,
}: {
	field: UseFormRegisterReturn<'slug'>;
	error?: RhfFieldError;
	user: UserProfile;
}) {
	return (
		<Field data-invalid={!!error}>
			<FieldLabel htmlFor="slug">課程網址</FieldLabel>
			<div className="flex flex-wrap">
				<span className="text-secondary-foreground bg-secondary t-body-3 block w-auto rounded-l-md p-2 whitespace-nowrap">
					{`https://webify.com/courses/${user.id || '你的名稱'}/`}
				</span>
				<Input
					id="slug"
					className="w-auto grow rounded-l-none"
					aria-invalid={!!error}
					{...field}
				/>
			</div>
			<FieldDescription>
				建議使用簡潔明瞭的網址，方便學員記憶和分享(最多30個字)
			</FieldDescription>
			<FieldError errors={[error]} />
		</Field>
	);
}
