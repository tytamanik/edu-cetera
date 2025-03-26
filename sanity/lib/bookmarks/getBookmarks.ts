import { defineQuery } from 'groq'
import { sanityFetch } from '../live'

export async function getBookmarks(studentId: string) {
	const getBookmarksQuery =
		defineQuery(`*[_type == "bookmark" && student._ref == $studentId] {
    ...,
    "course": course-> {
      ...,
      "slug": slug.current,
      "category": category->{...},
      "instructor": instructor->{...}
    }
  }`)

	const result = await sanityFetch({
		query: getBookmarksQuery,
		params: { studentId },
	})

	return result.data || []
}
