import { type SchemaTypeDefinition } from 'sanity'
import { blockContent } from './blockContent'
import { bookmarkType } from './bookmarkType'
import { categoryType } from './categoryType'
import { courseType } from './courseType'
import { enrollmentType } from './enrollmentType'
import { instructorType } from './instructorType'
import { lessonCompletionType } from './lessonCompletionType'
import { lessonType } from './lessonType'
import { moduleType } from './moduleType'
import { studentType } from './studentType'

export const schema: { types: SchemaTypeDefinition[] } = {
	types: [
		courseType,
		moduleType,
		lessonType,
		instructorType,
		blockContent,
		studentType,
		enrollmentType,
		categoryType,
		lessonCompletionType,
		bookmarkType,
	],
}

export * from './bookmarkType'
export * from './categoryType'
export * from './courseType'
export * from './enrollmentType'
export * from './instructorType'
export * from './lessonCompletionType'
export * from './lessonType'
export * from './moduleType'
export * from './studentType'
