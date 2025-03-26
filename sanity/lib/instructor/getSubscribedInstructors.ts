// File: sanity/lib/instructor/getSubscribedInstructors.ts
import { defineQuery } from 'groq'
import { sanityFetch } from '../live'
import { getStudentByClerkId } from '../student/getStudentByClerkId'

export async function getSubscribedInstructors(clerkId: string) {
	try {
		const student = await getStudentByClerkId(clerkId)

		if (!student?.data?._id) {
			return []
		}

		// Get the instructors the student has enrolled in courses from
		const instructorsQuery = defineQuery(`{
      "enrolledCourses": *[_type == "enrollment" && student._ref == $studentId].course._ref,
      "instructors": *[_type == "instructor" && 
                        count(*[_type == "course" && 
                              _id in $enrolledCoursesIds && 
                              instructor._ref == ^._id]) > 0] {
        _id,
        name,
        bio,
        photo,
        "courseCount": count(*[_type == "course" && instructor._ref == ^._id && published == true]),
        "courses": *[_type == "course" && instructor._ref == ^._id && published == true] | order(_createdAt desc)[0..2] {
          _id,
          title,
          "slug": slug.current,
          _createdAt
        }
      }
    }`)

		const result = await sanityFetch({
			query: instructorsQuery,
			params: {
				studentId: student.data._id,
				enrolledCoursesIds: [], // This will be populated from the first query result
			},
		})

		// Run a second query with the enrolled course IDs
		if (result.data?.enrolledCourses?.length) {
			const instructorsWithCoursesQuery =
				defineQuery(`*[_type == "instructor" && 
        count(*[_type == "course" && 
              _id in $enrolledCoursesIds && 
              instructor._ref == ^._id]) > 0] {
        _id,
        name,
        bio,
        photo,
        "courseCount": count(*[_type == "course" && instructor._ref == ^._id && published == true]),
        "recentCourses": *[_type == "course" && instructor._ref == ^._id && published == true] | order(_createdAt desc)[0..2] {
          _id,
          title,
          "slug": slug.current,
          _createdAt,
          description
        }
      }`)

			const instructorsResult = await sanityFetch({
				query: instructorsWithCoursesQuery,
				params: {
					enrolledCoursesIds: result.data.enrolledCourses,
				},
			})

			// Add real recent activity for instructors based on their latest courses
			return (instructorsResult.data || []).map((instructor: any) => {
				const latestCourse =
					instructor.recentCourses?.length > 0
						? instructor.recentCourses[0]
						: null

				return {
					...instructor,
					recentActivity: latestCourse
						? `Published a new course: ${latestCourse.title}`
						: 'No recent activity',
					recentCourse: latestCourse?.title || 'No recent courses',
					recentCourseSlug: latestCourse?.slug || '',
				}
			})
		}

		return []
	} catch (error) {
		console.error('Error fetching subscribed instructors:', error)
		return []
	}
}
