import type { Tables, TablesUpdate } from './database';
import type { CamelCasedProperties } from 'type-fest';

export type LessonDB = Tables<'lessons'>;
export type UpdateLessonDB = TablesUpdate<'lessons'>;
export type LessonContentsDB = Tables<'lesson_contents'>;
export type UpdateLessonContentsDB = TablesUpdate<'lesson_contents'>;

export type Lesson = CamelCasedProperties<LessonDB>;
export type LessonContents = CamelCasedProperties<LessonContentsDB>;

export type LessonForCourseDetail = Pick<Lesson, 'id' | 'title' | 'orderIndex'>;

type LessonForEdit = Pick<Lesson, 'id' | 'title' | 'orderIndex'>;
export type LessonAndContentForEdit = LessonForEdit & {
	videoUrl: LessonContents['videoUrl'];
	content: LessonContents['content'];
};
export type LessonForInsert = Pick<Lesson, 'title'>;
export type LessonTitles = Pick<Lesson, 'id' | 'title' | 'orderIndex'>[];
