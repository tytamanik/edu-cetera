import { getStudentByClerkId } from '../student/getStudentByClerkId'

export async function isUserInstructor(clerkId: string) {
	try {
		const student = await getStudentByClerkId(clerkId)

		if (!student?.data) {
			return false
		}

		return !!student.data.isInstructor
	} catch (error) {
		console.error('Error checking instructor status:', error)
		return false
	}
}
