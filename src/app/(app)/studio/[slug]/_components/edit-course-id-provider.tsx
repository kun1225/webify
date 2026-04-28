'use client';

import { createContext, useContext } from 'react';

const EditCourseIdContext = createContext<{ courseId: string } | null>(null);

export function EditCourseIdProvider({
	children,
	courseId,
}: {
	children: React.ReactNode;
	courseId: string;
}) {
	return (
		<EditCourseIdContext.Provider value={{ courseId }}>
			{children}
		</EditCourseIdContext.Provider>
	);
}

export function useEditCourseId() {
	const context = useContext(EditCourseIdContext);

	if (!context) {
		return { courseId: undefined };
	}

	return { courseId: context.courseId };
}
