'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';
import type { ComponentProps } from 'react';

const RichTextEditorCore = dynamic(
	() => import('./rich-text-editor-core').then((mod) => mod.RichTextEditorCore),
	{
		ssr: false,
		loading: () => <Skeleton className="min-h-48 w-full" />,
	},
);

export function RichTextEditor(
	props: ComponentProps<typeof RichTextEditorCore>,
) {
	return <RichTextEditorCore {...props} />;
}
