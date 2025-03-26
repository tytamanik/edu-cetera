// File: app/(creator)/creator-dashboard/courses/[courseId]/edit/page.tsx
import CourseForm from '@/components/dashboard/CourseForm'
import CoursePreviewButton from '@/components/dashboard/CoursePreviewButton'
import DeleteCourseButton from '@/components/dashboard/DeleteCourseButton'
import { Button } from '@/components/ui/button'
import { Category } from '@/sanity/lib/categories/getCategories'
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
		const [course, categoriesData] = await Promise.all([
			getCourseForEditing(courseId, user.id),
			import('@/sanity/lib/categories/getCategories').then(module =>
				module.getCategories()
			),
		])

		const categories = categoriesData.map((category: Category) => ({
			_id: category._id,
			name: category.name,
			slug: category.slug,
			color: category.color,
		}))

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

					<div className='flex items-center gap-3'>
						<CoursePreviewButton slug={course.slug?.current} />

						<DeleteCourseButton
							courseId={courseId}
							courseName={course.title}
							variant='destructive'
							size='sm'
						/>
					</div>
				</div>

				<div className='max-w-3xl mx-auto'>
					<h1 className='text-3xl font-bold mb-8'>Edit Course</h1>

					<CourseForm
						courseId={courseId}
						initialData={course}
						categories={categories}
					/>
				</div>
			</div>
		)
	} catch (error) {
		console.error('Error loading course:', error)
		return redirect('/creator-dashboard')
	}
}
