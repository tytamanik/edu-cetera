import groq from 'groq'
import { client } from '../adminClient'

export async function removeBookmark(studentId: string, courseId: string) {
	const query = groq`*[_type == "bookmark" && student._ref == $studentId && course._ref == $courseId][0]._id`
	const bookmarkId = await client.fetch(query, { studentId, courseId })

	if (bookmarkId) {
		return client.delete(bookmarkId)
	}

	return null
}
