import { defineField, defineType } from 'sanity'

export const instructorType = defineType({
	name: 'instructor',
	title: 'Instructor',
	type: 'document',
	fields: [
		defineField({
			name: 'name',
			title: 'Name',
			type: 'string',
			validation: rule => rule.required(),
		}),
		defineField({
			name: 'bio',
			title: 'Bio',
			type: 'text',
		}),
		defineField({
			name: 'photo',
			title: 'Photo',
			type: 'image',
		}),

		defineField({
			name: 'clerkId',
			title: 'Clerk ID',
			type: 'string',
			validation: rule => rule.required(),
		}),

		defineField({
			name: 'studentRef',
			title: 'Student Reference',
			type: 'reference',
			to: [{ type: 'student' }],
			validation: rule => rule.required(),
		}),
	],
})
