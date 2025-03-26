// File: app/(user)/page.tsx
import { CourseCard } from '@/components/CourseCard'
import { GetCoursesQueryResult } from '@/sanity.types'
import { getCourses } from '@/sanity/lib/courses/getCourses'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function Home() {
	const courses = (await getCourses()) as GetCoursesQueryResult

	return (
		<div className='container mx-auto px-4 py-6 pb-20 sm:pb-6'>
			<h1 className='text-2xl font-bold mb-6'>Featured Courses</h1>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
				{courses.map(course => (
					<CourseCard
						key={course._id}
						course={course}
						href={`/courses/${course.slug}`}
					/>
				))}
			</div>
		</div>
	)
}
