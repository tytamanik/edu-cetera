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
		defineField({
			name: 'featured',
			title: 'Featured Instructor',
			type: 'boolean',
			description: 'Show this instructor on the home page',
			initialValue: false,
		}),
		defineField({
			name: 'socialLinks',
			title: 'Social Links',
			type: 'object',
			fields: [
				defineField({
					name: 'website',
					title: 'Website',
					type: 'url',
				}),
				defineField({
					name: 'twitter',
					title: 'Twitter/X',
					type: 'url',
				}),
				defineField({
					name: 'linkedin',
					title: 'LinkedIn',
					type: 'url',
				}),
				defineField({
					name: 'github',
					title: 'GitHub',
					type: 'url',
				}),
			],
		}),
	],
	preview: {
		select: {
			title: 'name',
			subtitle: 'bio',
			media: 'photo',
		},
	},
})
