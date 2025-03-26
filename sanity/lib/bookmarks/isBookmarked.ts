import groq from 'groq'
import { sanityFetch } from '../live'

export async function isBookmarked(studentId: string, courseId: string) {
	const bookmarkQuery = groq`*[_type == "bookmark" && student._ref == $studentId && course._ref == $courseId][0]`

	const bookmark = await sanityFetch({
		query: bookmarkQuery,
		params: { studentId, courseId },
	})

	return !!bookmark.data
}
