import { currentUser } from '@clerk/nextjs/server'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import CourseContentEditor from '@/components/dashboard/CourseContentEditor'
import { Button } from '@/components/ui/button'
import { getCourseCurriculum } from '@/sanity/lib/courses/getCourseCurriculum'
import { getCourseForEditing } from '@/sanity/lib/courses/getCourseForEditing'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export interface Params {
	params: {
		courseId: string
	}
}

export interface PageProps extends Params {
	searchParams?: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	return {
		title: `Edit Course Content: ${params.courseId}`,
	}
}

export default async function CourseContentPage({ params }: PageProps) {
	const user = await currentUser()
	if (!user?.id) {
		return redirect('/')
	}

	const { courseId } = params

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
						initialCurriculum={{
							_id: courseId,
							title: course.title || 'Untitled Course',
							modules: curriculum.modules || [],
						}}
					/>
				</div>
			</div>
		)
	} catch (error) {
		console.error('Error loading course content:', error)
		return redirect('/creator-dashboard')
	}
}

export const dynamic = 'force-dynamic'
