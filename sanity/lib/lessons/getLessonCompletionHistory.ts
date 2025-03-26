// File: sanity/lib/lessons/getLessonCompletionHistory.ts
import { defineQuery } from 'groq'
import { urlFor } from '../image'
import { sanityFetch } from '../live'
import { getStudentByClerkId } from '../student/getStudentByClerkId'

export async function getLessonCompletionHistory(clerkId: string) {
	try {
		const student = await getStudentByClerkId(clerkId)

		if (!student?.data?._id) {
			throw new Error('Student not found')
		}

		const historyQuery =
			defineQuery(`*[_type == "lessonCompletion" && student._ref == $studentId] | order(completedAt desc) {
      _id,
      completedAt,
      "lesson": lesson->{
        _id,
        title,
        "slug": slug.current,
        description
      },
      "module": module->{
        _id,
        title
      },
      "course": course->{
        _id,
        title,
        "slug": slug.current,
        image
      }
    }`)

		const result = await sanityFetch({
			query: historyQuery,
			params: { studentId: student.data._id },
		})

		// Process the results to add image URLs and ensure consistent data structure
		return (result.data || []).map((completion: any) => ({
			...completion,
			completedAt: completion.completedAt || new Date().toISOString(),
			lesson: {
				...completion.lesson,
				_id: completion.lesson?._id || '',
				title: completion.lesson?.title || 'Unnamed Lesson',
				slug: completion.lesson?.slug || '',
				description: completion.lesson?.description || '',
			},
			module: {
				...completion.module,
				_id: completion.module?._id || '',
				title: completion.module?.title || 'Unnamed Module',
			},
			course: {
				...completion.course,
				_id: completion.course?._id || '',
				title: completion.course?.title || 'Unnamed Course',
				slug: completion.course?.slug || '',
				imageUrl: completion.course?.image
					? urlFor(completion.course.image).url()
					: null,
			},
		}))
	} catch (error) {
		console.error('Error fetching lesson completion history:', error)
		return []
	}
}
