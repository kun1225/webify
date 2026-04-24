import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';

import type {
	ControllerRenderProps,
	FieldError as RhfFieldError,
} from 'react-hook-form';
import type { UpsertCourseFormData } from '@/services/shared/validations';

export function CourseVisibility({
	field,
	error,
}: {
	field: ControllerRenderProps<UpsertCourseFormData, 'isHidden'>;
	error?: RhfFieldError;
}) {
	return (
		<Field data-invalid={!!error}>
			<FieldLabel className="w-full">
				<Card className="hover:bg-muted w-full">
					<CardContent className="flex flex-row items-center gap-4">
						<Checkbox
							ref={field.ref}
							checked={field.value}
							aria-invalid={!!error}
							onCheckedChange={field.onChange}
						/>

						<div>
							<p>在課程列表中隱藏</p>
							<FieldDescription>
								勾選後，課程將在課程列表中隱藏，學員將無法購買和觀看您的課程
							</FieldDescription>
						</div>
					</CardContent>
				</Card>
			</FieldLabel>
			<FieldError errors={[error]} />
		</Field>
	);
}
