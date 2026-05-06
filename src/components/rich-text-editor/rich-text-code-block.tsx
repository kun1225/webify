import React from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';

export function RichTextCodeBlock({
	node: {
		attrs: { language: defaultLanguage },
	},
	updateAttributes,
	extension,
}: ReactNodeViewProps) {
	return (
		<NodeViewWrapper className="code-block group relative">
			<Select
				value={defaultLanguage}
				onValueChange={(value) => updateAttributes({ language: value })}
			>
				<SelectTrigger
					size="sm"
					className="text-muted-foreground [&_svg]:stroke-muted-foreground absolute top-2 right-2 border-none opacity-0 shadow transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
				>
					<SelectValue placeholder="auto" />
				</SelectTrigger>

				<SelectContent>
					<SelectItem value="null">auto</SelectItem>
					{extension.options.lowlight
						.listLanguages()
						.map((lang: string, index: number) => (
							<SelectItem key={index} value={lang}>
								{lang}
							</SelectItem>
						))}
				</SelectContent>
			</Select>

			<pre>
				<NodeViewContent />
			</pre>
		</NodeViewWrapper>
	);
}
