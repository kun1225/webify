import { RichTextEditor } from '@/components/rich-text-editor';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

import type {
	ControllerRenderProps,
	FieldError as RhfFieldError,
} from 'react-hook-form';
import type { UpdateLessonFormData } from '@/services/shared/validations';
import type { EditorEvents } from '@tiptap/react';

export function LessonFormContent({
	field,
	error,
}: {
	field: ControllerRenderProps<UpdateLessonFormData, 'content'>;
	error?: RhfFieldError;
}) {
	const onRichTextChange = (props: EditorEvents['update']) => {
		field.onChange(props.editor.getJSON());
	};

	return (
		<Field data-invalid={!!error}>
			<FieldLabel htmlFor={field.name}>課程內容</FieldLabel>
			<RichTextEditor
				value={field.value}
				onChange={onRichTextChange}
				ariaInvalid={!!error}
			/>
			<FieldError errors={[error]} />
		</Field>
	);
}
