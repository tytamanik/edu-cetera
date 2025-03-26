import { getInstructorProfileAction } from '@/app/actions/instructorActions'
import CreateCourseButton from '@/components/dashboard/CreateCourseButton'
import InstructorCourseCard from '@/components/dashboard/InstructorCourseCard'
import { currentUser } from '@clerk/nextjs/server'
import { BookOpen, GraduationCap, PlusCircle, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function CreatorDashboardPage() {
	const user = await currentUser()

	if (!user?.id) {
		return redirect('/')
	}

	// Define an interface for the instructor profile response
	interface InstructorProfileResponse {
		success: boolean
		instructor: {
			_id?: string
			name?: string
			courses?: Course[]
			// Add other properties as needed
		} | null
		error?: string
	}

	const { success, instructor, error } = (await getInstructorProfileAction(
		user.id
	)) as InstructorProfileResponse

	if (!success || !instructor) {
		// If the user is not an instructor, redirect to the become an instructor page
		return redirect('/become-instructor')
	}

	const { courses = [] } = instructor

	// Define an interface for the course type
	interface Course {
		_id: string
		title?: string
		published?: boolean
		// Add other course properties you need
	}

	// Calculate some simple stats for the dashboard
	const totalCourses = courses.length
	const publishedCourses = courses.filter(
		(course: Course) => course.published
	).length
	const draftCourses = totalCourses - publishedCourses

	return (
		<div className='container mx-auto px-4 py-8 mt-16'>
			<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8'>
				<div className='flex items-center gap-2'>
					<GraduationCap className='w-8 h-8 text-primary' />
					<div>
						<h1 className='text-3xl font-bold'>Creator Dashboard</h1>
						<p className='text-muted-foreground'>
							Manage your courses and content
						</p>
					</div>
				</div>
				{/* We'll temporarily comment out the CreateCourseButton until we implement it */}
				{/* <CreateCourseButton /> */}
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
				<div className='bg-card rounded-lg shadow p-6 border'>
					<div className='flex items-center gap-4'>
						<div className='rounded-full bg-primary/10 p-3'>
							<BookOpen className='w-6 h-6 text-primary' />
						</div>
						<div>
							<p className='text-muted-foreground'>Total Courses</p>
							<h3 className='text-2xl font-bold'>{totalCourses}</h3>
						</div>
					</div>
				</div>

				<div className='bg-card rounded-lg shadow p-6 border'>
					<div className='flex items-center gap-4'>
						<div className='rounded-full bg-green-500/10 p-3'>
							<PlusCircle className='w-6 h-6 text-green-500' />
						</div>
						<div>
							<p className='text-muted-foreground'>Published Courses</p>
							<h3 className='text-2xl font-bold'>{publishedCourses}</h3>
						</div>
					</div>
				</div>

				<div className='bg-card rounded-lg shadow p-6 border'>
					<div className='flex items-center gap-4'>
						<div className='rounded-full bg-blue-500/10 p-3'>
							<Users className='w-6 h-6 text-blue-500' />
						</div>
						<div>
							<p className='text-muted-foreground'>Total Students</p>
							<h3 className='text-2xl font-bold'>-</h3>
						</div>
					</div>
				</div>
			</div>

			{/* Courses Section */}
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<h2 className='text-xl font-bold'>Your Courses</h2>
					<CreateCourseButton variant='outline' size='sm' />
				</div>

				{courses.length === 0 ? (
					<div className='bg-card rounded-lg shadow p-8 border text-center'>
						<div className='flex justify-center mb-4'>
							<div className='rounded-full bg-primary/10 p-4'>
								<BookOpen className='w-8 h-8 text-primary' />
							</div>
						</div>
						<h3 className='text-xl font-semibold mb-2'>No courses yet</h3>
						<p className='text-muted-foreground mb-6'>
							Create your first course and start sharing your knowledge with the
							world
						</p>
						<CreateCourseButton />
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{courses.map((course: Course) => (
							<InstructorCourseCard key={course._id} course={course} />
						))}
					</div>
				)}
			</div>
		</div>
	)
}
