import { defineQuery } from 'groq'
import { sanityFetch } from '../live'

export async function getInstructorById(instructorId: string) {
	try {
		const instructorQuery =
			defineQuery(`*[_type == "instructor" && _id == $instructorId][0] {
			_id,
			name,
			bio,
			photo,
			clerkId,
			"followerCount": count(*[_type == "instructorFollow" && instructor._ref == $instructorId]),
			"studentCount": count(*[_type == "enrollment" && course->instructor._ref == $instructorId]),
			"courses": *[_type == "course" && published == true && instructor._ref == $instructorId] {
				_id,
				title,
				"slug": slug.current,
				description,
				price,
				image,
				"category": category->{
					_id,
					name,
					"slug": slug.current,
					color
				},
				"enrollmentCount": count(*[_type == "enrollment" && course._ref == ^._id])
			}
		}`)

		const result = await sanityFetch({
			query: instructorQuery,
			params: { instructorId },
		})

		return result.data
	} catch (error) {
		console.error('Error fetching instructor by ID:', error)
		return null
	}
}
