'use server'

import { client } from '@/sanity/lib/adminClient'
import { getCategoryIdBySlug } from '@/sanity/lib/categories/getCategoryIdBySlug'
import { getInstructorByClerkId } from '@/sanity/lib/instructor/getInstructorByClerkId'
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

		const instructorResult = await getInstructorByClerkId(userId)
		const instructor = instructorResult.data

		if (!instructor) {
			return {
				success: false,
				error:
					'Instructor not found. Please ensure you have created an instructor profile.',
			}
		}

		let categoryId = await getCategoryIdBySlug(categorySlug)
		if (!categoryId) {
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

		const updates: Record<string, any> = {}

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
			}
		}

		await client.patch(courseId).set(updates).commit()

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

export async function publishCourseAction(courseId: string) {
	try {
		await client.patch(courseId).set({ published: true }).commit()

		revalidatePath('/creator-dashboard')
		revalidatePath(`/creator-dashboard/courses/${courseId}/edit`)
		revalidatePath('/courses')

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

export async function unpublishCourseAction(courseId: string) {
	try {
		await client.patch(courseId).set({ published: false }).commit()

		revalidatePath('/creator-dashboard')
		revalidatePath(`/creator-dashboard/courses/${courseId}/edit`)
		revalidatePath('/courses')

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

export async function deleteCourseAction(courseId: string) {
	try {
		await client.delete(courseId)

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

export async function updateCourseCurriculumAction(data: {
	courseId: string
	modules: {
		_id?: string
		_key?: string
		title: string
		isNew?: boolean
		lessons: {
			_id?: string
			_key?: string
			title: string
			slug?: { current: string }
			description?: string
			videoUrl?: string
			loomUrl?: string
			content?: any[]
			isNew?: boolean
		}[]
	}[]
}) {
	try {
		const { courseId, modules } = data

		for (const module of modules) {
			let moduleId = module._id

			if (module.isNew || !moduleId) {
				const newModule = await client.create({
					_type: 'module',
					title: module.title,
				})

				moduleId = newModule._id
			} else {
				await client
					.patch(moduleId)
					.set({
						title: module.title,
					})
					.commit()
			}

			const lessonRefs = []

			for (const lesson of module.lessons) {
				let lessonId = lesson._id

				if (lesson.isNew || !lessonId) {
					const newLesson = await client.create({
						_type: 'lesson',
						title: lesson.title,
						slug: {
							_type: 'slug',
							current: lesson.slug?.current || '',
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
								current: lesson.slug?.current || '',
							},
							description: lesson.description || '',
							videoUrl: lesson.videoUrl || '',
							loomUrl: lesson.loomUrl || '',
							content: lesson.content || [],
						})
						.commit()
				}

				lessonRefs.push({
					_key: lesson._key || lessonId,
					_type: 'reference',
					_ref: lessonId,
				})
			}

			await client
				.patch(moduleId)
				.set({
					lessons: lessonRefs,
				})
				.commit()

			await client
				.patch(courseId)
				.setIfMissing({
					modules: [],
				})
				.append('modules', [
					{
						_key: module._key || moduleId,
						_type: 'reference',
						_ref: moduleId,
					},
				])
				.commit()
		}

		const currentCourse = await client.fetch(
			`*[_type == "course" && _id == $courseId][0] {
        modules[]->._id
      }`,
			{ courseId }
		)

		if (currentCourse?.modules) {
			const currentModuleIds = currentCourse.modules.map((m: any) => m._id)
			const newModuleIds = modules.filter(m => m._id).map(m => m._id)

			const modulesToRemove = currentModuleIds.filter(
				(id: string) => !newModuleIds.includes(id)
			)

			if (modulesToRemove.length > 0) {
				const currentModulesArray = await client.fetch(
					`*[_type == "course" && _id == $courseId][0].modules`,
					{ courseId }
				)

				const updatedModules = currentModulesArray.filter(
					(moduleRef: any) => !modulesToRemove.includes(moduleRef._ref)
				)

				await client
					.patch(courseId)
					.set({
						modules: updatedModules,
					})
					.commit()
			}
		}

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
