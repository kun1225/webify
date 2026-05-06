'use client';

import { useState } from 'react';

import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import { RichTextEditor } from '@/components/rich-text-editor';
import { cn } from '@/lib/utils';

import type {
	ControllerRenderProps,
	FieldError as RhfFieldError,
} from 'react-hook-form';
import type { UpsertCourseFormData } from '@/services/shared/validations';
import type { EditorEvents } from '@tiptap/react';

export function CourseDescription({
	field,
	error,
}: {
	field: ControllerRenderProps<UpsertCourseFormData, 'description'>;
	error?: RhfFieldError;
}) {
	const [wordCount, setWordCount] = useState(0);

	const onRichTextChange = (props: EditorEvents['update']) => {
		const editor = props.editor;
		field.onChange(editor.getJSON());
		setWordCount(editor.getText().length ?? 0);
	};

	return (
		<Field data-invalid={!!error}>
			<FieldLabel htmlFor={field.name}>課程描述</FieldLabel>
			<RichTextEditor
				value={field.value}
				onChange={onRichTextChange}
				ariaInvalid={!!error}
				placeholder="請詳細描述您的課程內容、學習目標和適合的學員群體..."
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
			{error && <FieldError errors={[error]} />}
		</Field>
	);
}
