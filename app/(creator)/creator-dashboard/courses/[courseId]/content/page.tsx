// File: app/(creator)/creator-dashboard/courses/[courseId]/content/page.tsx
import CourseContentEditor from '@/components/dashboard/CourseContentEditor'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCourseCurriculum } from '@/sanity/lib/courses/getCourseCurriculum'
import { getCourseForEditing } from '@/sanity/lib/courses/getCourseForEditing'
import { currentUser } from '@clerk/nextjs/server'
import { ArrowLeft, BookOpen, Layers } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export interface CourseContentPageProps {
	params: Promise<{
		courseId: string
	}>
}

export default async function CourseContentPage({
	params,
}: CourseContentPageProps) {
	const user = await currentUser()

	if (!user?.id) {
		return redirect('/')
	}

	const { courseId } = await params

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
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
						<h1 className='text-3xl font-bold'>Course Content</h1>
						<Button asChild variant='outline' size='sm'>
							<Link href={`/courses/${course.slug?.current}`} target='_blank'>
								<BookOpen className='h-4 w-4 mr-2' />
								Preview Course
							</Link>
						</Button>
					</div>

					<div className='bg-card border rounded-lg p-6 mb-8'>
						<div className='flex items-center gap-3 mb-4'>
							<div className='bg-primary/10 p-2 rounded-full'>
								<Layers className='h-5 w-5 text-primary' />
							</div>
							<div>
								<h2 className='text-xl font-semibold'>{course.title}</h2>
								<p className='text-sm text-muted-foreground'>
									{curriculum.modules?.length || 0} modules ·{' '}
									{curriculum.modules?.reduce(
										(acc: number, module: { lessons?: Array<any> }) =>
											acc + (module.lessons?.length || 0),
										0
									) || 0}{' '}
									lessons
								</p>
							</div>
						</div>
						<p className='text-muted-foreground mb-2'>{course.description}</p>
						<div className='flex items-center gap-2 text-sm'>
							<span
								className={`px-2 py-1 rounded-full text-xs ${course.published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}
							>
								{course.published ? 'Published' : 'Draft'}
							</span>
							<span className='text-muted-foreground'>
								Price: ${course.price?.toFixed(2) || '0.00'}
							</span>
						</div>
					</div>

					<Tabs defaultValue='curriculum'>
						<TabsList className='w-full mb-6'>
							<TabsTrigger value='curriculum'>Curriculum</TabsTrigger>
						</TabsList>
						<TabsContent value='curriculum'>
							<CourseContentEditor
								courseId={courseId}
								initialCurriculum={curriculum}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		)
	} catch (error) {
		console.error('Error loading course:', error)
		return redirect('/creator-dashboard')
	}
}
