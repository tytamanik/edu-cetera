// File: sanity/lib/courses/getCourses.ts
import { defineQuery } from 'groq'
import { sanityFetch } from '../live'

export async function getCourses() {
	// Modified query to only return published courses
	const getCoursesQuery =
		defineQuery(`*[_type == "course" && published == true] {
    ...,
    "slug": slug.current,
    "category": category->{...},
    "instructor": instructor->{...}
  }`)

	const courses = await sanityFetch({ query: getCoursesQuery })
	return courses.data
}
