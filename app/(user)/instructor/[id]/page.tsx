import { CourseCard } from '@/components/CourseCard'
import { FollowInstructorButton } from '@/components/FollowInstructorButton'
import { Button } from '@/components/ui/button'
import { GetCoursesQueryResult } from '@/sanity.types'
import { urlFor } from '@/sanity/lib/image'
import { getInstructorById } from '@/sanity/lib/instructor/getInstructorById'
import { isFollowingInstructor } from '@/sanity/lib/instructor/isFollowingInstructor'
import { currentUser } from '@clerk/nextjs/server'
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function InstructorProfilePage({
	params,
}: {
	params: { id: string }
}) {
	const { id } = params
	const user = await currentUser()

	const [instructor, isFollowing] = await Promise.all([
		getInstructorById(id),
		user?.id ? isFollowingInstructor(user.id, id) : false,
	])

	if (!instructor) {
		return notFound()
	}

	return (
		<div className='container mx-auto px-4 py-8 pt-16'>
			<div className='flex items-center gap-4 mb-8'>
				<Link
					href='/'
					prefetch={false}
					className='text-muted-foreground hover:text-primary'
				>
					<ArrowLeft className='h-5 w-5' />
				</Link>
				<h1 className='text-3xl font-bold'>Instructor Profile</h1>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* Instructor profile sidebar */}
				<div className='bg-card rounded-lg border shadow-sm p-6'>
					<div className='flex flex-col items-center text-center'>
						<div className='relative h-32 w-32 rounded-full overflow-hidden mb-4'>
							{instructor.photo ? (
								<Image
									src={urlFor(instructor.photo).url()}
									alt={instructor.name || 'Instructor'}
									fill
									className='object-cover'
								/>
							) : (
								<div className='h-full w-full bg-muted flex items-center justify-center'>
									<GraduationCap className='h-16 w-16 text-muted-foreground' />
								</div>
							)}
						</div>

						<h2 className='text-2xl font-bold mb-2'>{instructor.name}</h2>

						{user?.id && (
							<div className='mt-4 w-full'>
								<FollowInstructorButton
									instructorId={instructor._id}
									isFollowing={isFollowing}
									userId={user.id}
								/>
							</div>
						)}

						<div className='mt-6 w-full'>
							<div className='flex items-center justify-between py-2 border-b'>
								<span className='text-muted-foreground'>Courses</span>
								<span className='font-medium'>
									{instructor.courses?.length || 0}
								</span>
							</div>
							<div className='flex items-center justify-between py-2 border-b'>
								<span className='text-muted-foreground'>Students</span>
								<span className='font-medium'>
									{instructor.studentCount || 0}
								</span>
							</div>
							<div className='flex items-center justify-between py-2'>
								<span className='text-muted-foreground'>Followers</span>
								<span className='font-medium'>
									{instructor.followerCount || 0}
								</span>
							</div>
						</div>
					</div>

					{instructor.bio && (
						<div className='mt-6'>
							<h3 className='font-medium mb-2'>About</h3>
							<p className='text-muted-foreground'>{instructor.bio}</p>
						</div>
					)}
				</div>

				{/* Instructor courses */}
				<div className='lg:col-span-2'>
					<div className='flex items-center justify-between mb-6'>
						<h2 className='text-xl font-bold'>Courses by {instructor.name}</h2>
					</div>

					{!instructor.courses || instructor.courses.length === 0 ? (
						<div className='text-center py-12 bg-muted/20 rounded-lg border border-dashed'>
							<BookOpen className='mx-auto h-12 w-12 text-muted-foreground mb-3' />
							<h3 className='text-lg font-medium mb-2'>No courses yet</h3>
							<p className='text-muted-foreground mb-6'>
								This instructor hasn&apos;t published any courses yet.
							</p>
							<Link href='/explore' prefetch={false}>
								<Button>Browse Other Courses</Button>
							</Link>
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							{instructor.courses.map(
								(course: GetCoursesQueryResult[number]) => (
									<CourseCard
										key={course._id}
										course={course}
										href={`/courses/${course.slug}`}
									/>
								)
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
