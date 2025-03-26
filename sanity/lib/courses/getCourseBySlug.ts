import { defineQuery } from 'groq'
import { getInstructorByClerkId } from '../instructor/getInstructorByClerkId'
import { sanityFetch } from '../live'

async function getCourseBySlug(slug: string, clerkId?: string | null) {
	let isInstructor = false

	if (clerkId) {
		const instructor = await getInstructorByClerkId(clerkId)
		isInstructor = !!instructor?.data?._id
	}

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

	if (course.data && isInstructor && clerkId) {
		const instructorData = await getInstructorByClerkId(clerkId)

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
