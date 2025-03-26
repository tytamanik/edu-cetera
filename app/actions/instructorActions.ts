'use server'

import { client } from '@/sanity/lib/adminClient'
import { createInstructorFromUser } from '@/sanity/lib/instructor/createInstructorFromUser'
import { getInstructorByClerkId } from '@/sanity/lib/instructor/getInstructorByClerkId'
import { isUserInstructor } from '@/sanity/lib/instructor/isUserInstructor'
import { revalidatePath } from 'next/cache'
export async function becomeInstructorAction(
	formData: FormData,
	clerkId: string
) {
	try {
		const name = formData.get('name') as string
		const bio = formData.get('bio') as string
		// In a real implementation, you'd handle photo upload here

		if (!name || !bio) {
			return { success: false, error: 'Name and bio are required' }
		}

		const result = await createInstructorFromUser({
			clerkId,
			name,
			bio,
		})

		if (result.success) {
			revalidatePath('/creator-dashboard')
			revalidatePath('/profile')
			revalidatePath('/')
		}

		return result
	} catch (error) {
		console.error('Error in becomeInstructorAction:', error)
		return { success: false, error: 'Failed to become an instructor' }
	}
}

export async function getInstructorProfileAction(clerkId: string) {
	try {
		const instructor = await getInstructorByClerkId(clerkId)
		return { success: true, instructor: instructor.data }
	} catch (error) {
		console.error('Error getting instructor profile:', error)
		return { success: false, error: 'Failed to get instructor profile' }
	}
}

export async function checkInstructorStatusAction(clerkId: string) {
	try {
		const isInstructor = await isUserInstructor(clerkId)
		return { isInstructor }
	} catch (error) {
		console.error('Error checking instructor status:', error)
		return { isInstructor: false, error: 'Failed to check instructor status' }
	}
}
export async function isUserCourseCreator(courseId: string, clerkId: string) {
	try {
		// First, get the instructor ID for this user
		const instructor = await getInstructorByClerkId(clerkId)

		if (!instructor?.data?._id) {
			return { isCreator: false }
		}

		// Check if this instructor is the creator of the course
		const instructorId = instructor.data._id

		// Check in Sanity if this course belongs to this instructor
		const query = `*[_type == "course" && _id == $courseId && instructor._ref == $instructorId][0]._id`
		const result = await client.fetch(query, { courseId, instructorId })

		return { isCreator: !!result }
	} catch (error) {
		console.error('Error checking if user is course creator:', error)
		return { isCreator: false, error: 'Failed to check course creator status' }
	}
}
