import { defineQuery } from 'groq'
import { sanityFetch } from '../live'

export async function getInstructorByClerkId(clerkId: string) {
	const getInstructorByClerkIdQuery = defineQuery(
		`*[_type == "instructor" && clerkId == $clerkId][0] {
      ...,
      "courses": *[_type == "course" && instructor._ref == ^._id] {
        ...,
        "slug": slug.current,
        "category": category->{...}
      }
    }`
	)

	const instructor = await sanityFetch({
		query: getInstructorByClerkIdQuery,
		params: { clerkId },
	})

	return instructor
}
