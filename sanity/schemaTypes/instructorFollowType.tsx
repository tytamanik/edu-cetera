import { defineField, defineType } from 'sanity'

export const instructorFollowType = defineType({
	name: 'instructorFollow',
	title: 'Instructor Follow',
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
			name: 'instructor',
			title: 'Instructor',
			type: 'reference',
			to: [{ type: 'instructor' }],
			validation: rule => rule.required(),
		}),
		defineField({
			name: 'followedAt',
			title: 'Followed At',
			type: 'datetime',
			initialValue: () => new Date().toISOString(),
		}),
	],
	preview: {
		select: {
			studentFirstName: 'student.firstName',
			studentLastName: 'student.lastName',
			instructorName: 'instructor.name',
		},
		prepare({ studentFirstName, studentLastName, instructorName }) {
			return {
				title: `${studentFirstName || ''} ${studentLastName || ''} follows ${instructorName || 'Instructor'}`,
			}
		},
	},
})
