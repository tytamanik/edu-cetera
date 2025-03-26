// File: sanity/lib/student/getEnrolledCourses.ts
import { defineQuery } from 'groq'
import { sanityFetch } from '../live'

export async function getEnrolledCourses(clerkId: string) {
	const getEnrolledCoursesQuery =
		defineQuery(`*[_type == "student" && clerkId == $clerkId][0] {
    "enrolledCourses": *[_type == "enrollment" && student._ref == ^._id] {
      ...,
      "course": course-> {
        ...,
        "slug": slug.current,
        "category": category->{...},
        "instructor": instructor->{...}
      }
    }
  }`)

	const result = await sanityFetch({
		query: getEnrolledCoursesQuery,
		params: { clerkId },
	})

	// Keep all enrolled courses regardless of published status
	// The user has already enrolled and should be able to access them
	return result?.data?.enrolledCourses || []
}
