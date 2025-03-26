import { defineQuery } from 'groq'
import { sanityFetch } from '../live'
import { CourseFilters, getAllCourses } from './getAllCourses'

export async function searchCourses(
	term: string,
	filters?: Omit<CourseFilters, 'search'>,
	sort?: string
) {
	if (term && term.trim() !== '') {
		return getAllCourses(
			{
				...filters,
				search: term.trim(),
			},
			sort
		)
	}

	if (filters && Object.keys(filters).length > 0) {
		return getAllCourses(filters, sort)
	}

	const searchQuery = defineQuery(`*[_type == "course" && published == true] {
    ...,
    "slug": slug.current,
    "category": category->{...},
    "instructor": instructor->{...}
  }`)

	const result = await sanityFetch({
		query: searchQuery,
	})

	return result.data || []
}
