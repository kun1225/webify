'use client';

import { useRef } from 'react';

import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import { Placeholder } from '@tiptap/extensions';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import StarterKit from '@tiptap/starter-kit';

import { toast } from 'sonner';
import { all, createLowlight } from 'lowlight';

import { cn } from '@/lib/utils';

import { uploadRichTextImage } from '@/services/client/rich-text';

import { RichTextToolbar } from './rich-text-toolbar';
import { RichTextCodeBlock } from './rich-text-code-block';

const lowlight = createLowlight(all);

import type { Editor, EditorEvents, JSONContent } from '@tiptap/core';

export function RichTextEditorCore({
	value = {},
	onChange,
	placeholder = '請輸入內容...',
	className = '',
	showToolbar = true,
	isViewMode = false,
	disabled = false,
	ariaInvalid = false,
}: {
	value?: JSONContent;
	onChange?: ((props: EditorEvents['update']) => void) | undefined;
	placeholder?: string;
	className?: string;
	showToolbar?: boolean;
	isViewMode?: boolean;
	disabled?: boolean;
	ariaInvalid?: boolean;
}) {
	const editorRef = useRef<Editor | null>(null);

	const handleImageUpload = async (files: FileList | File[] | null) => {
		const editorInstance = editorRef.current;
		if (!editorInstance || !files || !editorInstance.isEditable) return;

		toast.promise(
			async () => {
				const results = await uploadRichTextImage(files[0]);
				if (!results.ok) {
					throw new Error(results.message);
				}
				return results.data;
			},
			{
				loading: '上傳圖片中...',
				success: (data: string) => {
					editorInstance.chain().focus().setImage({ src: data }).run();
					return '上傳成功';
				},
				error: (err: Error) => {
					editorInstance.chain().focus().undo().run();
					return err.message || '上傳失敗，請稍後再試';
				},
			},
		);
	};

	const codeblockExtension = isViewMode
		? CodeBlockLowlight.configure({ lowlight })
		: CodeBlockLowlight.extend({
				addNodeView() {
					return ReactNodeViewRenderer(RichTextCodeBlock);
				},
			}).configure({ lowlight });

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				codeBlock: false,
			}),
			codeblockExtension,
			Image.configure({ inline: false }),
			Placeholder.configure({ placeholder }),
		],
		content: value,
		editable: !disabled && !isViewMode,
		onUpdate: onChange,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				'aria-invalid': ariaInvalid ? 'true' : 'false',
				class: cn(
					'tiptap prose prose-pre:text-base max-w-none border border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:inset-shadow-sm aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 md:t-body-3 field-sizing-content min-h-24 w-full bg-transparent px-3 py-2 transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
					showToolbar ? 'rounded-b-md' : 'rounded-md border shadow-xs',
					isViewMode && 'border-none shadow-none p-0',
					className,
				),
			},
			handleDrop: (view, event) => {
				if (!editorRef.current?.isEditable) return false;

				const files = (event as DragEvent).dataTransfer?.files;
				if (!files?.length) return false;

				const hasImage = Array.from(files).some((file) =>
					file.type.startsWith('image/'),
				);
				if (!hasImage) return false;

				event.preventDefault();

				const coordinates = {
					left: (event as DragEvent).clientX,
					top: (event as DragEvent).clientY,
				};
				const pos = view.posAtCoords(coordinates);

				if (pos) {
					editorRef.current?.chain().setTextSelection(pos.pos).run();
				}

				handleImageUpload(files);
				return true;
			},
		},
		onCreate: ({ editor }) => {
			editorRef.current = editor;
		},
		onDestroy: () => {
			editorRef.current = null;
		},
	});

	if (!editor) {
		return null;
	}

	return (
		<div className={cn(showToolbar && 'shadow-xs')}>
			{showToolbar && (
				<RichTextToolbar editor={editor} onImageUpload={handleImageUpload} />
			)}
			<EditorContent editor={editor} />
		</div>
	);
}
