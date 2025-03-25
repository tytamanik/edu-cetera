// sanity/schemaTypes/bookmarkType.tsx
// Create this new file
import { defineField, defineType } from 'sanity'

export const bookmarkType = defineType({
	name: 'bookmark',
	title: 'Bookmark',
	type: 'document',
	fields: [
		defineField({
			name: 'student',
			title: 'Student',
			type: 'reference',
			to: [{ type: 'student' }],
			validation: rule => rule.required(),
		}),
		defineField({
			name: 'course',
			title: 'Course',
			type: 'reference',
			to: [{ type: 'course' }],
			validation: rule => rule.required(),
		}),
		defineField({
			name: 'createdAt',
			title: 'Created At',
			type: 'datetime',
			initialValue: () => new Date().toISOString(),
		}),
	],
	preview: {
		select: {
			courseTitle: 'course.title',
			studentFirstName: 'student.firstName',
			studentLastName: 'student.lastName',
		},
		prepare({ courseTitle, studentFirstName, studentLastName }) {
			return {
				title: courseTitle || 'Unnamed Course',
				subtitle: `Bookmarked by ${studentFirstName} ${studentLastName}`,
			}
		},
	},
})
