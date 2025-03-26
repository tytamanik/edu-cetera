// app/actions/courseActions.ts
// Server actions for course management with real Sanity integration

'use server'

import { client } from '@/sanity/lib/adminClient'
import { getCategoryIdBySlug } from '@/sanity/lib/categories/getCategoryIdBySlug'
import { getInstructorByClerkId } from '@/sanity/lib/instructor/getInstructorByClerkId'
import { revalidatePath } from 'next/cache'

export async function createCourseAction(formData: FormData) {
	try {
		// Get form data
		const title = formData.get('title') as string
		const slug = formData.get('slug') as string
		const description = formData.get('description') as string
		const categorySlug = formData.get('category') as string
		const price = Number(formData.get('price')) || 0
		const userId = formData.get('userId') as string

		// Validate required fields
		if (!title || !slug || !description || !categorySlug) {
			return { success: false, error: 'Missing required fields' }
		}

		if (!userId) {
			return { success: false, error: 'User not authenticated' }
		}

		// Get instructor profile
		const instructorResult = await getInstructorByClerkId(userId)
		const instructor = instructorResult.data

		if (!instructor) {
			return {
				success: false,
				error:
					'Instructor not found. Please ensure you have created an instructor profile.',
			}
		}

		// Get category ID
		let categoryId = await getCategoryIdBySlug(categorySlug)
		if (!categoryId) {
			// Create category if it doesn't exist
			const newCategory = await client.create({
				_type: 'category',
				name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
				slug: {
					_type: 'slug',
					current: categorySlug,
				},
			})
			categoryId = newCategory._id
		}

		// Create course in Sanity
		const course = await client.create({
			_type: 'course',
			title,
			slug: {
				_type: 'slug',
				current: slug,
			},
			description,
			price,
			instructor: {
				_type: 'reference',
				_ref: instructor._id,
			},
			category: {
				_type: 'reference',
				_ref: categoryId,
			},
			published: false,
			createdAt: new Date().toISOString(),
		})

		// Revalidate relevant paths
		revalidatePath('/creator-dashboard')
		revalidatePath(`/creator-dashboard/courses/${course._id}/edit`)
		revalidatePath('/courses')

		return {
			success: true,
			courseId: course._id,
			message: 'Course created successfully',
		}
	} catch (error) {
		console.error('Error creating course:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create course',
		}
	}
}

export async function updateCourseAction(formData: FormData) {
	try {
		const courseId = formData.get('courseId') as string

		if (!courseId) {
			return { success: false, error: 'Course ID is required' }
		}

		// Get form data
		const title = formData.get('title') as string
		const description = formData.get('description') as string
		const categorySlug = formData.get('category') as string
		const price = Number(formData.get('price')) || 0
		const published = formData.get('published') === 'true'

		// Create update object
		const updates: Record<string, any> = {}

		if (title) updates.title = title
		if (description) updates.description = description
		if (price !== undefined) updates.price = price
		if (published !== undefined) updates.published = published

		// Update category if provided
		if (categorySlug) {
			const categoryId = await getCategoryIdBySlug(categorySlug)
			if (categoryId) {
				updates.category = {
					_type: 'reference',
					_ref: categoryId,
				}
			}
		}

		// Update course in Sanity
		await client.patch(courseId).set(updates).commit()

		// Revalidate relevant paths
		revalidatePath('/creator-dashboard')
		revalidatePath(`/creator-dashboard/courses/${courseId}/edit`)
		revalidatePath('/courses')

		return {
			success: true,
			message: 'Course updated successfully',
		}
	} catch (error) {
		console.error('Error updating course:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update course',
		}
	}
}

export async function deleteCourseAction(courseId: string) {
	try {
		// Delete course from Sanity
		await client.delete(courseId)

		// Revalidate relevant paths
		revalidatePath('/creator-dashboard')
		revalidatePath('/courses')

		return {
			success: true,
			message: 'Course deleted successfully',
		}
	} catch (error) {
		console.error('Error deleting course:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete course',
		}
	}
}
