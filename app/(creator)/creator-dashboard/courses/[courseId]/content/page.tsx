import { Button } from '@/components/ui/button'
import { getCourseForEditing } from '@/sanity/lib/courses/getCourseForEditing'
import { currentUser } from '@clerk/nextjs/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface CourseContentPageProps {
	params: {
		courseId: string
	}
}

export default async function CourseContentPage({
	params,
}: CourseContentPageProps) {
	const user = await currentUser()

	if (!user?.id) {
		return redirect('/')
	}

	const courseId = params.courseId

	try {
		const course = await getCourseForEditing(courseId, user.id)

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

					<div className='bg-card border rounded-lg p-8 text-center'>
						<h2 className='text-xl font-semibold mb-3'>
							Content Editor Coming Soon
						</h2>
						<p className='text-muted-foreground mb-6'>
							This is where you&apos;ll be able to add modules and lessons to
							your course.
						</p>
						<p className='text-sm text-muted-foreground'>
							For now, please use the main dashboard to manage your course
							details.
						</p>
					</div>
				</div>
			</div>
		)
	} catch (error) {
		console.error('Error loading course:', error)
		return redirect('/creator-dashboard')
	}
}
