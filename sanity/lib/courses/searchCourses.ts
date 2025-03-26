// File: sanity/lib/courses/searchCourses.ts - Replace the entire content of this file
import { defineQuery } from 'groq'
import { sanityFetch } from '../live'
import { CourseFilters, getAllCourses } from './getAllCourses'

export async function searchCourses(
	term: string,
	filters?: Omit<CourseFilters, 'search'>,
	sort?: string
) {
	// If we have a search term, use it with our filters
	if (term && term.trim() !== '') {
		return getAllCourses(
			{
				...filters,
				search: term.trim(),
			},
			sort
		)
	}

	// If no search term but we have filters, still use our getAllCourses function
	if (filters && Object.keys(filters).length > 0) {
		return getAllCourses(filters, sort)
	}

	// Default behavior - just get all published courses
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
