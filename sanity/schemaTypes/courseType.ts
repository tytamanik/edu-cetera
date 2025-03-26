// sanity/schemaTypes/courseType.ts
// Update this file to add published field and createdAt field

import { defineField, defineType } from 'sanity'

export const courseType = defineType({
	name: 'course',
	title: 'Course',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			validation: rule => rule.required(),
		}),
		{
			name: 'price',
			title: 'Price (USD)',
			type: 'number',
			description: 'Price in USD',
			validation: Rule => Rule.min(0),
		},
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'title',
				maxLength: 96,
			},
			validation: rule => rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Description',
			type: 'text',
		}),
		defineField({
			name: 'image',
			title: 'Course Image',
			type: 'image',
		}),
		defineField({
			name: 'category',
			title: 'Category',
			type: 'reference',
			to: [{ type: 'category' }],
			validation: rule => rule.required(),
		}),
		defineField({
			name: 'modules',
			title: 'Modules',
			type: 'array',
			of: [{ type: 'reference', to: { type: 'module' } }],
		}),
		defineField({
			name: 'instructor',
			title: 'Instructor',
			type: 'reference',
			to: { type: 'instructor' },
		}),
		// Add published field to control visibility
		defineField({
			name: 'published',
			title: 'Published',
			type: 'boolean',
			description: 'Controls if the course is visible to students',
			initialValue: false,
		}),
		// Add createdAt field for sorting and filtering
		defineField({
			name: 'createdAt',
			title: 'Created At',
			type: 'datetime',
			initialValue: () => new Date().toISOString(),
		}),
	],
})
