// sanity/schemaTypes/studentType.tsx
// Update this file to add isInstructor field and instructor reference

import Image from 'next/image'
import { defineField, defineType } from 'sanity'

export const studentType = defineType({
	name: 'student',
	title: 'Student',
	type: 'document',
	fields: [
		defineField({
			name: 'firstName',
			title: 'First Name',
			type: 'string',
		}),
		defineField({
			name: 'lastName',
			title: 'Last Name',
			type: 'string',
		}),
		defineField({
			name: 'email',
			title: 'Email',
			type: 'string',
			validation: rule => rule.required(),
		}),
		defineField({
			name: 'clerkId',
			title: 'Clerk User ID',
			type: 'string',
			validation: rule => rule.required(),
		}),
		defineField({
			name: 'imageUrl',
			title: 'Profile Image URL',
			type: 'url',
		}),
		// Add isInstructor field
		defineField({
			name: 'isInstructor',
			title: 'Is Instructor',
			type: 'boolean',
			initialValue: false,
		}),
		// Add reference to instructor document
		defineField({
			name: 'instructor',
			title: 'Instructor Profile',
			type: 'reference',
			to: [{ type: 'instructor' }],
			hidden: ({ document }) => !document?.isInstructor,
		}),
	],
	preview: {
		select: {
			firstName: 'firstName',
			lastName: 'lastName',
			imageUrl: 'imageUrl',
			isInstructor: 'isInstructor',
		},
		prepare({ firstName, lastName, imageUrl, isInstructor }) {
			return {
				title: `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)} ${lastName.charAt(0).toUpperCase()}${lastName.slice(1)}`,
				subtitle: isInstructor ? 'Student & Instructor' : 'Student',
				media: (
					<Image
						src={imageUrl}
						alt={`${firstName} ${lastName}`}
						width={100}
						height={100}
					/>
				),
			}
		},
	},
})
