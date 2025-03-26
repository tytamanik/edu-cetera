// sanity/lib/courses/getCourseForEditing.ts
// Function to fetch a course for editing

import { defineQuery } from 'groq'
import { getInstructorByClerkId } from '../instructor/getInstructorByClerkId'
import { sanityFetch } from '../live'

export async function getCourseForEditing(courseId: string, clerkId: string) {
	// First check if the user is the instructor of this course
	const instructor = await getInstructorByClerkId(clerkId)

	if (!instructor?.data?._id) {
		throw new Error('Not authorized: User is not an instructor')
	}

	const query =
		defineQuery(`*[_type == "course" && _id == $courseId && instructor._ref == $instructorId][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    price,
    published,
    "category": category->{
      _id,
      name,
      "slug": slug.current
    },
    image
  }`)

	const result = await sanityFetch({
		query,
		params: {
			courseId,
			instructorId: instructor.data._id,
		},
	})

	if (!result.data) {
		throw new Error('Course not found or you do not have permission to edit it')
	}

	return result.data
}
