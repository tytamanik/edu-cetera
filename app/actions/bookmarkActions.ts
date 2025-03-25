// app/actions/bookmarkActions.ts
// Create this new file
'use server'

import { createBookmark } from '@/sanity/lib/bookmarks/createBookmark'
import { isBookmarked } from '@/sanity/lib/bookmarks/isBookmarked'
import { removeBookmark } from '@/sanity/lib/bookmarks/removeBookmark'
import { getStudentByClerkId } from '@/sanity/lib/student/getStudentByClerkId'

export async function toggleBookmarkAction(courseId: string, clerkId: string) {
	try {
		const student = await getStudentByClerkId(clerkId)

		if (!student?.data?._id) {
			throw new Error('Student not found')
		}

		const studentId = student.data._id
		const isCurrentlyBookmarked = await isBookmarked(studentId, courseId)

		if (isCurrentlyBookmarked) {
			await removeBookmark(studentId, courseId)
			return { success: true, bookmarked: false }
		} else {
			await createBookmark(studentId, courseId)
			return { success: true, bookmarked: true }
		}
	} catch (error) {
		console.error('Error toggling bookmark:', error)
		return { success: false, error: 'Failed to toggle bookmark' }
	}
}

export async function getIsBookmarkedAction(courseId: string, clerkId: string) {
	try {
		const student = await getStudentByClerkId(clerkId)

		if (!student?.data?._id) {
			return false
		}

		return isBookmarked(student.data._id, courseId)
	} catch (error) {
		console.error('Error checking bookmark status:', error)
		return false
	}
}
