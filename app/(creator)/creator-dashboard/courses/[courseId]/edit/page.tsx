// Course Edit Page
import CourseForm from '@/components/dashboard/CourseForm'
import { Button } from '@/components/ui/button'
import { getCourseForEditing } from '@/sanity/lib/courses/getCourseForEditing'
import { currentUser } from '@clerk/nextjs/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export interface CourseEditPageProps {
	params: Promise<{
		courseId: string
	}>
}

export default async function CourseEditPage({ params }: CourseEditPageProps) {
	const user = await currentUser()

	if (!user?.id) {
		return redirect('/')
	}

	const { courseId } = await params

	try {
		const course = await getCourseForEditing(courseId, user.id)

		return (
			<div className='container mx-auto px-4 py-8 mt-16'>
				<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8'>
					<div className='flex items-center gap-x-2'>
						<Button variant='ghost' size='sm' asChild>
							<Link href='/creator-dashboard'>
								<ArrowLeft className='h-4 w-4 mr-2' />
								Back to Dashboard
							</Link>
						</Button>
					</div>
				</div>

				<div className='max-w-3xl mx-auto'>
					<h1 className='text-3xl font-bold mb-8'>Edit Course</h1>

					<CourseForm courseId={courseId} initialData={course} />
				</div>
			</div>
		)
	} catch (error) {
		console.error('Error loading course:', error)
		return redirect('/creator-dashboard')
	}
}
