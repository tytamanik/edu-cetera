import groq from 'groq'
import { client } from '../adminClient'
import { sanityFetch } from '../live'

interface UncompleteLessonParams {
	lessonId: string
	clerkId: string
}

export async function uncompleteLessonById({
	lessonId,
	clerkId,
}: UncompleteLessonParams) {
	const student = await sanityFetch({
		query: groq`*[_type == "student" && clerkId == $clerkId][0]._id`,
		params: { clerkId },
	})

	if (!student.data) {
		throw new Error('Student not found')
	}

	await client.delete({
		query: `*[_type == "lessonCompletion" && student._ref == $studentId && lesson._ref == $lessonId][0]`,
		params: { studentId: student.data, lessonId },
	})
}
