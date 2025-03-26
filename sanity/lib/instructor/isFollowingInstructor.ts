import { defineQuery } from 'groq'
import { sanityFetch } from '../live'
import { getStudentByClerkId } from '../student/getStudentByClerkId'

export async function isFollowingInstructor(
	clerkId: string,
	instructorId: string
) {
	try {
		const student = await getStudentByClerkId(clerkId)

		if (!student?.data?._id) {
			return false
		}

		const followQuery = defineQuery(`*[_type == "instructorFollow" && 
			student._ref == $studentId && 
			instructor._ref == $instructorId
		][0]`)

		const result = await sanityFetch({
			query: followQuery,
			params: {
				studentId: student.data._id,
				instructorId,
			},
		})

		return !!result.data
	} catch (error) {
		console.error('Error checking if following instructor:', error)
		return false
	}
}
