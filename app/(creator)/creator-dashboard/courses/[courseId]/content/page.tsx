/* eslint-disable @typescript-eslint/no-explicit-any */
import CourseContentEditor from '@/components/dashboard/CourseContentEditor'
import { Button } from '@/components/ui/button'
import { getCourseCurriculum } from '@/sanity/lib/courses/getCourseCurriculum'
import { getCourseForEditing } from '@/sanity/lib/courses/getCourseForEditing'
import { currentUser } from '@clerk/nextjs/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function CourseContentPage(props: any) {
	const { params } = props
	const courseId = params.courseId

	const user = await currentUser()

	if (!user?.id) {
		return redirect('/')
	}

	try {
		const course = await getCourseForEditing(courseId, user.id)
		const curriculum = await getCourseCurriculum(courseId)

		return (
			<div className='container mx-auto px-4 py-8 mt-16'>
				<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8'>
					<div className='flex items-center gap-x-2'>
						<Button variant='ghost' size='sm' asChild>
							<Link href={`/creator-dashboard/courses/${courseId}/edit`}>
								<ArrowLeft className='h-4 w-4 mr-2' />
								Back to Course Settings
							</Link>
						</Button>
					</div>
				</div>

				<div className='max-w-4xl mx-auto'>
					<h1 className='text-3xl font-bold mb-8'>
						Course Content: {course.title}
					</h1>

					<CourseContentEditor
						courseId={courseId}
						initialCurriculum={curriculum}
					/>
				</div>
			</div>
		)
	} catch (error) {
		console.error('Error loading course:', error)
		return redirect('/creator-dashboard')
	}
}
