// File: sanity/lib/courses/getCourseBySlug.ts
import { defineQuery } from 'groq'
import { getInstructorByClerkId } from '../instructor/getInstructorByClerkId'
import { sanityFetch } from '../live'

async function getCourseBySlug(slug: string, clerkId?: string | null) {
	// If clerkId is provided, check if user is the instructor of this course
	let isInstructor = false

	if (clerkId) {
		const instructor = await getInstructorByClerkId(clerkId)
		isInstructor = !!instructor?.data?._id
	}

	// Modified query to check published status
	// If the user is potentially an instructor, we'll retrieve the course and check ownership later
	const getCourseBySlugQuery = isInstructor
		? defineQuery(`*[_type == "course" && slug.current == $slug][0] {
        ...,
        "category": category->{...},
        "instructor": instructor->{...},
        "modules": modules[]-> {
          ...,
          "lessons": lessons[]-> {...}
        }
      }`)
		: defineQuery(`*[_type == "course" && slug.current == $slug && published == true][0] {
        ...,
        "category": category->{...},
        "instructor": instructor->{...},
        "modules": modules[]-> {
          ...,
          "lessons": lessons[]-> {...}
        }
      }`)

	const course = await sanityFetch({
		query: getCourseBySlugQuery,
		params: { slug },
	})

	// If the user is potentially an instructor, verify they are the course owner
	if (course.data && isInstructor && clerkId) {
		const instructorData = await getInstructorByClerkId(clerkId)

		// Return the course only if published OR if the current user is the course instructor
		if (
			course.data.published ||
			(instructorData?.data?._id &&
				course.data.instructor?._id === instructorData.data._id)
		) {
			return course.data
		} else {
			return null
		}
	}

	return course.data
}

export default getCourseBySlug
