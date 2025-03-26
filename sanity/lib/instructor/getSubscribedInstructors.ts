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

		// Get the instructors the student follows
		const followedInstructorsQuery =
			defineQuery(`*[_type == "instructorFollow" && student._ref == $studentId] {
      "instructor": instructor-> {
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
          description,
          image
        },
        "followerCount": count(*[_type == "instructorFollow" && instructor._ref == ^._id]),
        "studentCount": count(*[_type == "enrollment" && course->instructor._ref == ^._id])
      },
      followedAt
    } | order(followedAt desc)`)

		const result = await sanityFetch({
			query: followedInstructorsQuery,
			params: {
				studentId: student.data._id,
			},
		})

		// Map the results to get just the instructor objects with the followedAt data
		return (result.data || []).map((follow: any) => {
			const instructor = follow.instructor || {}

			// Add activity information based on most recent course
			const latestCourse =
				instructor.recentCourses && instructor.recentCourses.length > 0
					? instructor.recentCourses[0]
					: null

			return {
				...instructor,
				followedAt: follow.followedAt,
				recentActivity: latestCourse
					? `Published a new course: ${latestCourse.title}`
					: 'No recent activity',
				recentCourse: latestCourse?.title || 'No recent courses',
				recentCourseSlug: latestCourse?.slug || '',
				recentCourseImage: latestCourse?.image || null,
				recentCourseDate: latestCourse?._createdAt
					? new Date(latestCourse._createdAt).toLocaleDateString()
					: '',
			}
		})
	} catch (error) {
		console.error('Error fetching subscribed instructors:', error)
		return []
	}
}
