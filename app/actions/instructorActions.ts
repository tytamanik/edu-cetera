// File: app/actions/instructorActions.ts
'use server'

import { client } from '@/sanity/lib/adminClient'
import { createInstructorFromUser } from '@/sanity/lib/instructor/createInstructorFromUser'
import {
	followInstructor,
	unfollowInstructor,
} from '@/sanity/lib/instructor/followInstructor'
import { getInstructorByClerkId } from '@/sanity/lib/instructor/getInstructorByClerkId'
import { isFollowingInstructor } from '@/sanity/lib/instructor/isFollowingInstructor'
import { isUserInstructor } from '@/sanity/lib/instructor/isUserInstructor'
import { getStudentByClerkId } from '@/sanity/lib/student/getStudentByClerkId'
import { revalidatePath } from 'next/cache'

export async function becomeInstructorAction(
	formData: FormData,
	clerkId: string
) {
	try {
		const name = formData.get('name') as string
		const bio = formData.get('bio') as string

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

export async function toggleFollowInstructorAction(
	instructorId: string,
	clerkId: string
) {
	try {
		const student = await getStudentByClerkId(clerkId)

		if (!student?.data?._id) {
			return { success: false, error: 'Student not found' }
		}

		const isFollowing = await isFollowingInstructor(clerkId, instructorId)

		if (isFollowing) {
			// Unfollow the instructor
			await unfollowInstructor(student.data._id, instructorId)
		} else {
			// Follow the instructor
			await followInstructor(student.data._id, instructorId)
		}

		revalidatePath('/subscriptions')
		revalidatePath(`/instructor/${instructorId}`)

		return {
			success: true,
			following: !isFollowing,
			message: isFollowing ? 'Unfollowed instructor' : 'Following instructor',
		}
	} catch (error) {
		console.error('Error toggling instructor follow:', error)
		return {
			success: false,
			error: 'Failed to toggle instructor follow',
		}
	}
}

export async function isUserCourseCreator(courseId: string, clerkId: string) {
	try {
		const instructor = await getInstructorByClerkId(clerkId)

		if (!instructor?.data?._id) {
			return { isCreator: false }
		}

		const instructorId = instructor.data._id

		const query = `*[_type == "course" && _id == $courseId && instructor._ref == $instructorId][0]._id`
		const result = await client.fetch(query, { courseId, instructorId })

		return { isCreator: !!result }
	} catch (error) {
		console.error('Error checking if user is course creator:', error)
		return { isCreator: false, error: 'Failed to check course creator status' }
	}
}
