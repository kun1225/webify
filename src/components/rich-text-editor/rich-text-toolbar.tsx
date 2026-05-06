'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { Editor, useEditorState } from '@tiptap/react';
import {
	Bold,
	Italic,
	Strikethrough,
	Code,
	Code2,
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	Quote,
	Undo,
	Redo,
	Link as LinkIcon,
	Trash,
	Check,
	Image as ImageIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { TextSelection } from '@tiptap/pm/state';

interface RichTextToolbarProps {
	editor: Editor;
	className?: string;
	onImageUpload?: (files: FileList | null) => void;
}

export function RichTextToolbar({
	editor,
	onImageUpload,
	className,
}: RichTextToolbarProps) {
	// according to the editor state, we can derive all the values needed for the toolbar
	const {
		bold,
		italic,
		strike,
		code,
		codeBlock,
		h1,
		h2,
		h3,
		bulletList,
		orderedList,
		blockquote,
		canUndo,
		canRedo,
		canEditLink,
	} = useEditorState({
		editor,
		selector: ({ editor }: { editor: Editor }) => {
			const sel = editor?.state.selection;
			const hasTextSelection =
				!!sel && sel instanceof TextSelection && !sel.empty;

			return {
				bold: editor?.isActive('bold') ?? false,
				italic: editor?.isActive('italic') ?? false,
				strike: editor?.isActive('strike') ?? false,
				code: editor?.isActive('code') ?? false,
				codeBlock: editor?.isActive('codeBlock') ?? false,
				h1: editor?.isActive('heading', { level: 1 }) ?? false,
				h2: editor?.isActive('heading', { level: 2 }) ?? false,
				h3: editor?.isActive('heading', { level: 3 }) ?? false,
				bulletList: editor?.isActive('bulletList') ?? false,
				orderedList: editor?.isActive('orderedList') ?? false,
				blockquote: editor?.isActive('blockquote') ?? false,
				canUndo: !!editor?.can().undo(),
				canRedo: !!editor?.can().redo(),
				canEditLink: hasTextSelection,
			};
		},
	});

	const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
	const [linkValue, setLinkValue] = useState('');

	const savedRangeRef = useRef<{ from: number; to: number } | null>(null);
	const anchorPosRef = useRef<{ x: number; y: number } | null>(null);
	const imageInputRef = useRef<HTMLInputElement | null>(null);

	if (!editor) return null;

	const setHeading = (level: 1 | 2 | 3) =>
		editor.chain().focus().toggleHeading({ level }).run();

	const toggleBold = () => editor.chain().focus().toggleBold().run();
	const toggleItalic = () => editor.chain().focus().toggleItalic().run();
	const toggleStrike = () => editor.chain().focus().toggleStrike().run();
	const toggleCode = () => editor.chain().focus().toggleCode().run();
	const toggleCodeBlock = () => editor.chain().focus().toggleCodeBlock().run();
	const toggleBulletList = () =>
		editor.chain().focus().toggleBulletList().run();
	const toggleOrderedList = () =>
		editor.chain().focus().toggleOrderedList().run();
	const toggleBlockquote = () =>
		editor.chain().focus().toggleBlockquote().run();

	const undo = () => editor.chain().focus().undo().run();
	const redo = () => editor.chain().focus().redo().run();

	const openImagePicker = () => {
		if (!editor.isEditable) return;
		imageInputRef.current?.click();
	};

	const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		onImageUpload?.(files ?? null);
		event.target.value = '';
	};

	const openLinkPopoverAtSelection = () => {
		const { from, to } = editor.state.selection;
		if (from === to) return;

		savedRangeRef.current = { from, to };

		const rect = editor.view.coordsAtPos(to);
		anchorPosRef.current = { x: rect.left, y: rect.bottom };

		const previousUrl = editor.getAttributes('link').href || '';
		setLinkValue(previousUrl);
		setLinkPopoverOpen(true);
	};

	const applyLink = (url: string) => {
		if (!savedRangeRef.current) return;

		const chain = editor.chain().focus().setTextSelection({
			from: savedRangeRef.current.from,
			to: savedRangeRef.current.to,
		});

		if (url.trim() === '') {
			chain.extendMarkRange('link').unsetLink().run();
		} else {
			chain.extendMarkRange('link').setLink({ href: url.trim() }).run();
		}

		setLinkPopoverOpen(false);
		anchorPosRef.current = null;
	};

	return (
		<div
			className={cn(
				'bg-muted border-input flex flex-wrap justify-between gap-1 rounded-t-md border-t border-r border-l p-2',
				className,
			)}
		>
			<input
				type="file"
				accept="image/*"
				multiple
				ref={imageInputRef}
				onChange={handleImageInputChange}
				className="hidden"
			/>

			<div className="flex items-center gap-2">
				<ButtonGroup>
					<Button
						variant={h1 ? 'default' : 'ghost'}
						size="icon-sm"
						onClick={() => setHeading(1)}
						title="標題 1"
					>
						<Heading1 />
					</Button>
					<Button
						variant={h2 ? 'default' : 'ghost'}
						size="icon-sm"
						onClick={() => setHeading(2)}
						title="標題 2"
					>
						<Heading2 />
					</Button>
					<Button
						variant={h3 ? 'default' : 'ghost'}
						size="icon-sm"
						onClick={() => setHeading(3)}
						title="標題 3"
					>
						<Heading3 />
					</Button>
				</ButtonGroup>

				<Separator orientation="vertical" />

				<ButtonGroup>
					<Button
						variant={bold ? 'default' : 'ghost'}
						size="icon-sm"
						onClick={toggleBold}
						title="粗體"
					>
						<Bold />
					</Button>
					<Button
						variant={italic ? 'default' : 'ghost'}
						size="icon-sm"
						onClick={toggleItalic}
						title="斜體"
					>
						<Italic />
					</Button>
					<Button
						variant={strike ? 'default' : 'ghost'}
						size="icon-sm"
						onClick={toggleStrike}
						title="刪除線"
					>
						<Strikethrough />
					</Button>
					<Button
						variant={code ? 'default' : 'ghost'}
						size="icon-sm"
						onClick={toggleCode}
						title="行內程式碼"
					>
						<Code />
					</Button>
				</ButtonGroup>

				<Separator orientation="vertical" />

				<ButtonGroup>
					<Button
						variant={codeBlock ? 'default' : 'ghost'}
						size="icon-sm"
						onClick={toggleCodeBlock}
						title="程式碼區塊"
					>
						<Code2 />
					</Button>
				</ButtonGroup>

				<Separator orientation="vertical" />

				<ButtonGroup>
					<Button
						variant={bulletList ? 'default' : 'ghost'}
						size="icon-sm"
						onClick={toggleBulletList}
						title="無序列表"
					>
						<List />
					</Button>
					<Button
						variant={orderedList ? 'default' : 'ghost'}
						size="icon-sm"
						onClick={toggleOrderedList}
						title="有序列表"
					>
						<ListOrdered />
					</Button>
					<Button
						variant={blockquote ? 'default' : 'ghost'}
						size="icon-sm"
						onClick={toggleBlockquote}
						title="引用"
					>
						<Quote />
					</Button>
				</ButtonGroup>

				<Separator orientation="vertical" />

				<ButtonGroup>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={openImagePicker}
						disabled={!editor.isEditable}
						title="插入圖片"
					>
						<ImageIcon />
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={openLinkPopoverAtSelection}
						disabled={!canEditLink}
						title="添加連結"
					>
						<LinkIcon />
					</Button>
				</ButtonGroup>
			</div>

			<ButtonGroup>
				<Separator orientation="vertical" />

				<Button
					variant="ghost"
					size="icon-sm"
					onClick={undo}
					disabled={!canUndo}
					title="復原"
				>
					<Undo />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={redo}
					disabled={!canRedo}
					title="重做"
				>
					<Redo />
				</Button>
			</ButtonGroup>

			<Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
				<PopoverTrigger asChild>
					<div
						aria-hidden
						style={{
							position: 'fixed',
							left: anchorPosRef.current?.x ?? -9999,
							top: anchorPosRef.current?.y ?? -9999,
							width: 0,
							height: 0,
							padding: 0,
							border: 'none',
							background: 'transparent',
						}}
					/>
				</PopoverTrigger>

				<PopoverContent
					side="bottom"
					align="start"
					sideOffset={6}
					alignOffset={-12}
					className="flex w-auto items-center"
				>
					<Input
						autoFocus
						value={linkValue}
						onChange={(e) => setLinkValue(e.target.value)}
						placeholder="https://example.com"
						className="w-72"
					/>

					<Button
						variant="secondary"
						size="icon"
						className="ml-4"
						onClick={() => {
							setLinkValue('');
							applyLink('');
						}}
					>
						<Trash />
					</Button>
					<Button
						size="icon"
						className="ml-2"
						onClick={() => applyLink(linkValue)}
					>
						<Check />
					</Button>
				</PopoverContent>
			</Popover>
		</div>
	);
}

function ButtonGroup({ children }: { children: React.ReactNode }) {
	return <div className="flex items-center gap-1">{children}</div>;
}
