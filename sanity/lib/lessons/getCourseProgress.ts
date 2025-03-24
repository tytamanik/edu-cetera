import { calculateCourseProgress } from '@/lib/courseProgress'
import { Module } from '@/sanity.types'
import { defineQuery } from 'groq'
import { sanityFetch } from '../live'
import { getStudentByClerkId } from '../student/getStudentByClerkId'

export async function getCourseProgress(clerkId: string, courseId: string) {
	const student = await getStudentByClerkId(clerkId)

	if (!student?.data?._id) {
		throw new Error('Student not found')
	}

	const progressQuery = defineQuery(`{
    "completedLessons": *[_type == "lessonCompletion" && student._ref == $studentId && course._ref == $courseId] {
      ...,
      "lesson": lesson->{...},
      "module": module->{...}
    },
    "course": *[_type == "course" && _id == $courseId][0] {
      ...,
      "modules": modules[]-> {
        ...,
        "lessons": lessons[]-> {...}
      }
    }
  }`)

	const result = await sanityFetch({
		query: progressQuery,
		params: { studentId: student.data._id, courseId },
	})

	const { completedLessons = [], course } = result.data

	const courseProgress = calculateCourseProgress(
		(course?.modules as unknown as Module[]) || null,
		completedLessons
	)

	return {
		completedLessons,
		courseProgress,
	}
}
