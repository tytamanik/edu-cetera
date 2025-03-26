// File: app/actions/courseActions.ts
'use server'

import { client } from '@/sanity/lib/adminClient'
import { getCategoryIdBySlug } from '@/sanity/lib/categories/getCategoryIdBySlug'
import { getInstructorByClerkId } from '@/sanity/lib/instructor/getInstructorByClerkId'
import { isUserInstructor } from '@/sanity/lib/instructor/isUserInstructor'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function createCourseAction(formData: FormData) {
	try {
		const title = formData.get('title') as string
		const slug = formData.get('slug') as string
		const description = formData.get('description') as string
		const categorySlug = formData.get('category') as string
		const price = Number(formData.get('price')) || 0
		const userId = formData.get('userId') as string

		if (!title || !slug || !description || !categorySlug) {
			return { success: false, error: 'Missing required fields' }
		}

		if (!userId) {
			return { success: false, error: 'User not authenticated' }
		}

		// Check if user is an instructor
		const isInstructor = await isUserInstructor(userId)
		if (!isInstructor) {
			return {
				success: false,
				error: 'You must be registered as an instructor to create courses',
			}
		}

		const instructorResult = await getInstructorByClerkId(userId)
		const instructor = instructorResult.data

		if (!instructor) {
			return {
				success: false,
				error:
					'Instructor not found. Please ensure you have created an instructor profile.',
			}
		}

		const categoryId = await getCategoryIdBySlug(categorySlug)
		if (!categoryId) {
			return {
				success: false,
				error: 'Category not found. Please select a valid category.',
			}
		}

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

		const title = formData.get('title') as string
		const description = formData.get('description') as string
		const categorySlug = formData.get('category') as string
		const price = Number(formData.get('price')) || 0
		const published = formData.get('published') === 'true'
		const userId = formData.get('userId') as string

		if (!userId) {
			return { success: false, error: 'User not authenticated' }
		}

		// Check if this is user's course
		const instructorResult = await getInstructorByClerkId(userId)
		const instructor = instructorResult.data

		if (!instructor) {
			return { success: false, error: 'Instructor profile not found' }
		}

		// Check if course exists and belongs to this instructor
		const courseExists = await client.fetch(
			`*[_type == "course" && _id == $courseId && instructor._ref == $instructorId][0]._id`,
			{ courseId, instructorId: instructor._id }
		)

		if (!courseExists) {
			return {
				success: false,
				error: 'Course not found or you do not have permission to edit it',
			}
		}

		const updates: Record<string, unknown> = {}

		if (title) updates.title = title
		if (description) updates.description = description
		if (price !== undefined) updates.price = price
		if (published !== undefined) updates.published = published

		if (categorySlug) {
			const categoryId = await getCategoryIdBySlug(categorySlug)
			if (categoryId) {
				updates.category = {
					_type: 'reference',
					_ref: categoryId,
				}
			} else {
				return {
					success: false,
					error: 'Category not found. Please select a valid category.',
				}
			}
		}

		await client.patch(courseId).set(updates).commit()

		revalidatePath('/creator-dashboard')
		revalidatePath(`/creator-dashboard/courses/${courseId}/edit`)
		revalidatePath(`/creator-dashboard/courses/${courseId}/content`)
		revalidatePath('/courses')
		revalidatePath(`/courses/[slug]`)

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

export async function publishCourseAction(courseId: string, userId: string) {
	try {
		const instructorResult = await getInstructorByClerkId(userId)

		if (!instructorResult.data) {
			return { success: false, error: 'Instructor profile not found' }
		}

		const instructorId = instructorResult.data._id

		// Verify course belongs to instructor
		const courseExists = await client.fetch(
			`*[_type == "course" && _id == $courseId && instructor._ref == $instructorId][0]._id`,
			{ courseId, instructorId }
		)

		if (!courseExists) {
			return {
				success: false,
				error: 'Course not found or you do not have permission to publish it',
			}
		}

		await client.patch(courseId).set({ published: true }).commit()

		revalidatePath('/creator-dashboard')
		revalidatePath(`/creator-dashboard/courses/${courseId}/edit`)
		revalidatePath(`/courses`)

		return {
			success: true,
			message: 'Course published successfully',
		}
	} catch (error) {
		console.error('Error publishing course:', error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to publish course',
		}
	}
}

export async function unpublishCourseAction(courseId: string, userId: string) {
	try {
		const instructorResult = await getInstructorByClerkId(userId)

		if (!instructorResult.data) {
			return { success: false, error: 'Instructor profile not found' }
		}

		const instructorId = instructorResult.data._id

		// Verify course belongs to instructor
		const courseExists = await client.fetch(
			`*[_type == "course" && _id == $courseId && instructor._ref == $instructorId][0]._id`,
			{ courseId, instructorId }
		)

		if (!courseExists) {
			return {
				success: false,
				error: 'Course not found or you do not have permission to unpublish it',
			}
		}

		await client.patch(courseId).set({ published: false }).commit()

		revalidatePath('/creator-dashboard')
		revalidatePath(`/creator-dashboard/courses/${courseId}/edit`)
		revalidatePath(`/courses`)

		return {
			success: true,
			message: 'Course unpublished successfully',
		}
	} catch (error) {
		console.error('Error unpublishing course:', error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to unpublish course',
		}
	}
}

export async function deleteCourseAction(courseId: string, userId: string) {
	try {
		// Verify the user is an instructor
		const instructorResult = await getInstructorByClerkId(userId)

		if (!instructorResult?.data?._id) {
			return { success: false, error: 'Instructor profile not found' }
		}

		const instructorId = instructorResult.data._id

		// Verify course belongs to instructor
		const courseExists = await client.fetch(
			`*[_type == "course" && _id == $courseId && instructor._ref == $instructorId][0]._id`,
			{ courseId, instructorId }
		)

		if (!courseExists) {
			return {
				success: false,
				error: 'Course not found or you do not have permission to delete it',
			}
		}

		// Get all modules to delete them too
		const modules = await client.fetch(
			`*[_type == "course" && _id == $courseId][0].modules[]._ref`,
			{ courseId }
		)

		if (modules && modules.length > 0) {
			for (const moduleId of modules) {
				const lessons = await client.fetch(
					`*[_type == "module" && _id == $moduleId][0].lessons[]._ref`,
					{ moduleId }
				)

				if (lessons && lessons.length > 0) {
					for (const lessonId of lessons) {
						// Delete lesson completions
						const completionIds = await client.fetch(
							`*[_type == "lessonCompletion" && lesson._ref == $lessonId]._id`,
							{ lessonId }
						)
						for (const id of completionIds) {
							await client.delete(id)
						}
						// Delete the lesson
						await client.delete(lessonId)
					}
				}

				// Delete the module
				await client.delete(moduleId)
			}
		}

		// Delete enrollments
		const enrollmentIds = await client.fetch(
			`*[_type == "enrollment" && course._ref == $courseId]._id`,
			{ courseId }
		)
		for (const id of enrollmentIds) {
			await client.delete(id)
		}

		// Delete bookmarks
		const bookmarkIds = await client.fetch(
			`*[_type == "bookmark" && course._ref == $courseId]._id`,
			{ courseId }
		)
		for (const id of bookmarkIds) {
			await client.delete(id)
		}

		// Finally delete the course itself
		await client.delete(courseId)

		// Revalidate necessary paths
		revalidatePath('/creator-dashboard')
		revalidatePath('/courses')
		revalidatePath('/my-courses')

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

interface Lesson {
	_id?: string
	_key?: string
	title: string
	slug?: { current: string }
	description?: string
	videoUrl?: string
	loomUrl?: string
	content?: unknown[]
	isNew?: boolean
}

interface CourseModule {
	_id?: string
	_key?: string
	title: string
	isNew?: boolean
	lessons: Lesson[]
}

interface CurriculumData {
	courseId: string
	modules: CourseModule[]
}

export async function uploadCourseImageAction(formData: FormData) {
	try {
		const image = formData.get('image') as File
		const courseId = formData.get('courseId') as string

		if (!image || !courseId) {
			return { success: false, error: 'Missing image or course ID' }
		}

		// Get the user from Clerk authentication
		const { userId } = await auth()

		// If no authenticated user, return an error
		if (!userId) {
			return { success: false, error: 'User authentication required' }
		}

		const instructorResult = await getInstructorByClerkId(userId)
		if (!instructorResult?.data?._id) {
			return { success: false, error: 'Instructor profile not found' }
		}

		const instructorId = instructorResult.data._id

		// Verify course belongs to instructor
		const courseExists = await client.fetch(
			`*[_type == "course" && _id == $courseId && instructor._ref == $instructorId][0]._id`,
			{ courseId, instructorId }
		)

		if (!courseExists) {
			return {
				success: false,
				error: 'Course not found or you do not have permission to modify it',
			}
		}

		// Convert the file to a buffer
		const bytes = await image.arrayBuffer()
		const buffer = Buffer.from(bytes)

		// Upload the image to Sanity
		const imageAsset = await client.assets.upload('image', buffer, {
			filename: image.name,
			contentType: image.type,
		})

		// Update the course with the new image
		await client
			.patch(courseId)
			.set({
				image: {
					_type: 'image',
					asset: {
						_type: 'reference',
						_ref: imageAsset._id,
					},
				},
			})
			.commit()

		// Revalidate paths
		revalidatePath(`/creator-dashboard/courses/${courseId}/edit`)
		revalidatePath(`/creator-dashboard`)
		revalidatePath(`/courses`)

		return {
			success: true,
			imageUrl: imageAsset.url,
			message: 'Image uploaded successfully',
		}
	} catch (error) {
		console.error('Error uploading course image:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to upload image',
		}
	}
}
// Update the key generation logic in the updateCourseCurriculumAction
export async function updateCourseCurriculumAction(data: CurriculumData) {
	try {
		const { courseId, modules } = data

		const processedModules = await Promise.all(
			modules.map(async (courseModule, moduleIndex) => {
				let moduleId = courseModule._id

				// Ensure consistent key generation
				const moduleKey =
					courseModule._key || `module-${moduleId || moduleIndex}-${Date.now()}`

				if (courseModule.isNew || !moduleId) {
					const newModule = await client.create({
						_type: 'module',
						title: courseModule.title,
					})

					moduleId = newModule._id
				} else {
					await client
						.patch(moduleId)
						.set({
							title: courseModule.title,
						})
						.commit()
				}

				const processedLessons = await Promise.all(
					courseModule.lessons.map(async (lesson, lessonIndex) => {
						// Ensure consistent key generation for lessons
						const lessonKey =
							lesson._key || `lesson-${lesson._id || lessonIndex}-${Date.now()}`

						let lessonId = lesson._id

						if (lesson.isNew || !lessonId) {
							const newLesson = await client.create({
								_type: 'lesson',
								title: lesson.title,
								slug: {
									_type: 'slug',
									current:
										lesson.slug?.current ||
										lesson.title.toLowerCase().replace(/\s+/g, '-'),
								},
								description: lesson.description || '',
								videoUrl: lesson.videoUrl || '',
								loomUrl: lesson.loomUrl || '',
								content: lesson.content || [],
							})

							lessonId = newLesson._id
						} else {
							await client
								.patch(lessonId)
								.set({
									title: lesson.title,
									slug: {
										_type: 'slug',
										current:
											lesson.slug?.current ||
											lesson.title.toLowerCase().replace(/\s+/g, '-'),
									},
									description: lesson.description || '',
									videoUrl: lesson.videoUrl || '',
									loomUrl: lesson.loomUrl || '',
									content: lesson.content || [],
								})
								.commit()
						}

						return {
							_key: lessonKey,
							_type: 'reference',
							_ref: lessonId,
						}
					})
				)

				// Attach lessons to the module
				await client
					.patch(moduleId)
					.set({
						lessons: processedLessons,
					})
					.commit()

				return {
					_key: moduleKey,
					_type: 'reference',
					_ref: moduleId,
				}
			})
		)

		// Update course modules
		await client
			.patch(courseId)
			.set({
				modules: processedModules,
			})
			.commit()

		// Revalidate paths
		revalidatePath(`/creator-dashboard/courses/${courseId}/content`)
		revalidatePath(`/creator-dashboard/courses/${courseId}/edit`)
		revalidatePath(`/creator-dashboard`)

		return {
			success: true,
			message: 'Course curriculum updated successfully',
		}
	} catch (error) {
		console.error('Error updating course curriculum:', error)
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to update course curriculum',
		}
	}
}
