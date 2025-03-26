import { checkInstructorStatusAction } from '@/app/actions/instructorActions'
import { CourseCard } from '@/components/CourseCard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GetCoursesQueryResult } from '@/sanity.types'
import { getBookmarks } from '@/sanity/lib/bookmarks/getBookmarks'
import { getCourseProgress } from '@/sanity/lib/lessons/getCourseProgress'
import { getEnrolledCourses } from '@/sanity/lib/student/getEnrolledCourses'
import { getStudentByClerkId } from '@/sanity/lib/student/getStudentByClerkId'
import { currentUser } from '@clerk/nextjs/server'
import { Bookmark, BookOpen, GraduationCap, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
export default async function ProfilePage() {
	const user = await currentUser()

	if (!user?.id) {
		return redirect('/')
	}

	const student = await getStudentByClerkId(user.id)

	if (!student?.data?._id) {
		return (
			<div className='container mx-auto px-4 py-8 pt-16'>
				<div className='flex items-center gap-4 mb-8'>
					<User className='h-8 w-8 text-primary' />
					<h1 className='text-3xl font-bold'>Profile</h1>
				</div>
				<div className='text-center py-12 bg-card rounded-lg border shadow-sm'>
					<User className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
					<h2 className='text-2xl font-semibold mb-4'>Account not found</h2>
					<p className='text-muted-foreground mb-8 max-w-md mx-auto'>
						Your student account hasn&apos;t been set up properly.
					</p>
					<Link href='/' prefetch={false}>
						<Button>Return to Home</Button>
					</Link>
				</div>
			</div>
		)
	}

	const [enrolledCoursesResult, bookmarksResult, { isInstructor }] =
		await Promise.all([
			getEnrolledCourses(user.id),
			getBookmarks(student.data._id),
			checkInstructorStatusAction(user.id),
		])

	const enrolledCourses = enrolledCoursesResult || []
	const bookmarks = bookmarksResult || []

	const coursesWithProgress = await Promise.all(
		enrolledCourses.map(async ({ course, _id }) => {
			if (!course) return null
			try {
				const progress = await getCourseProgress(user.id, course._id)
				return {
					course,
					progress: progress.courseProgress,
					enrollmentId: _id,
				}
			} catch (error) {
				console.error(`Error getting progress for course ${course._id}:`, error)
				return {
					course,
					progress: 0,
					enrollmentId: _id,
				}
			}
		})
	)

	const validCoursesWithProgress = coursesWithProgress.filter(
		course => course !== null
	)

	const totalCoursesEnrolled = validCoursesWithProgress.length
	const completedCourses = validCoursesWithProgress.filter(
		course => course?.progress === 100
	).length
	const averageProgress =
		totalCoursesEnrolled > 0
			? validCoursesWithProgress.reduce(
					(sum, course) => sum + (course?.progress || 0),
					0
				) / totalCoursesEnrolled
			: 0

	return (
		<div className='container mx-auto px-4 py-8 pt-16'>
			<div className='flex items-center gap-4 mb-8'>
				<User className='h-8 w-8 text-primary' />
				<h1 className='text-3xl font-bold'>Profile</h1>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8'>
				<div className='lg:col-span-1'>
					<div className='bg-card rounded-lg shadow-sm border p-6'>
						<div className='flex flex-col items-center text-center'>
							<div className='relative w-24 h-24 mb-4'>
								<Image
									src={user.imageUrl || '/placeholder-avatar.png'}
									alt={user.firstName || 'User'}
									fill
									className='rounded-full object-cover border-4 border-background'
								/>
							</div>
							<h2 className='text-xl font-bold'>
								{user.firstName} {user.lastName}
							</h2>
							<p className='text-muted-foreground mt-1'>
								{user.emailAddresses[0]?.emailAddress}
							</p>

							<div className='mt-6 w-full'>
								<div className='flex items-center justify-between border-t pt-4'>
									<span className='text-sm text-muted-foreground'>
										Account Type
									</span>
									<span className='text-sm font-medium'>
										{isInstructor ? 'Instructor & Student' : 'Student'}
									</span>
								</div>

								<div className='flex items-center justify-between border-t pt-4 mt-4'>
									<span className='text-sm text-muted-foreground'>Joined</span>
									<span className='text-sm font-medium'>
										{new Date(student.data._createdAt).toLocaleDateString()}
									</span>
								</div>

								<div className='flex items-center justify-between border-t pt-4 mt-4'>
									<span className='text-sm text-muted-foreground'>
										Courses Enrolled
									</span>
									<span className='text-sm font-medium'>
										{totalCoursesEnrolled}
									</span>
								</div>

								<div className='flex items-center justify-between border-t pt-4 mt-4'>
									<span className='text-sm text-muted-foreground'>
										Average Progress
									</span>
									<span className='text-sm font-medium'>
										{Math.round(averageProgress)}%
									</span>
								</div>
							</div>

							{!isInstructor && (
								<div className='mt-6 w-full'>
									<Link href='/become-instructor' prefetch={false}>
										<Button variant='outline' className='w-full'>
											<GraduationCap className='mr-2 h-4 w-4' />
											Become an Instructor
										</Button>
									</Link>
								</div>
							)}

							{isInstructor && (
								<div className='mt-6 w-full'>
									<Link href='/creator-dashboard' prefetch={false}>
										<Button variant='outline' className='w-full'>
											<GraduationCap className='mr-2 h-4 w-4' />
											Creator Dashboard
										</Button>
									</Link>
								</div>
							)}
						</div>
					</div>

					{/* User Stats Card */}
					<div className='bg-card rounded-lg shadow-sm border p-6 mt-6'>
						<h3 className='font-medium mb-4'>Learning Stats</h3>
						<div className='space-y-4'>
							<div>
								<div className='flex justify-between text-sm mb-1'>
									<span className='text-muted-foreground'>
										Courses In Progress
									</span>
									<span className='font-medium'>
										{totalCoursesEnrolled - completedCourses}
									</span>
								</div>
								<div className='h-2 bg-muted rounded-full overflow-hidden'>
									<div
										className='h-full bg-blue-500 rounded-full'
										style={{
											width: `${((totalCoursesEnrolled - completedCourses) / Math.max(totalCoursesEnrolled, 1)) * 100}%`,
										}}
									></div>
								</div>
							</div>

							<div>
								<div className='flex justify-between text-sm mb-1'>
									<span className='text-muted-foreground'>
										Courses Completed
									</span>
									<span className='font-medium'>{completedCourses}</span>
								</div>
								<div className='h-2 bg-muted rounded-full overflow-hidden'>
									<div
										className='h-full bg-green-500 rounded-full'
										style={{
											width: `${(completedCourses / Math.max(totalCoursesEnrolled, 1)) * 100}%`,
										}}
									></div>
								</div>
							</div>

							<div>
								<div className='flex justify-between text-sm mb-1'>
									<span className='text-muted-foreground'>Bookmarks</span>
									<span className='font-medium'>{bookmarks.length}</span>
								</div>
								<div className='h-2 bg-muted rounded-full overflow-hidden'>
									<div
										className='h-full bg-yellow-500 rounded-full'
										style={{ width: '100%' }}
									></div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='lg:col-span-2'>
					<Tabs defaultValue='courses' className='w-full'>
						<TabsList className='mb-8'>
							<TabsTrigger value='courses' className='flex-1'>
								<BookOpen className='h-4 w-4 mr-2' />
								My Courses
							</TabsTrigger>
							<TabsTrigger value='bookmarks' className='flex-1'>
								<Bookmark className='h-4 w-4 mr-2' />
								Bookmarks
							</TabsTrigger>
						</TabsList>

						<TabsContent value='courses'>
							<div className='space-y-6'>
								<div className='flex items-center justify-between'>
									<h2 className='text-xl font-semibold'>Enrolled Courses</h2>
									<Link
										href='/my-courses'
										prefetch={false}
										className='text-primary hover:underline text-sm'
									>
										View All
									</Link>
								</div>

								{validCoursesWithProgress.length === 0 ? (
									<div className='text-center py-12 bg-muted/20 rounded-lg border border-dashed'>
										<BookOpen className='mx-auto h-12 w-12 text-muted-foreground mb-3' />
										<h3 className='text-lg font-medium mb-2'>No courses yet</h3>
										<p className='text-muted-foreground mb-6 max-w-md mx-auto'>
											You haven&apos;t enrolled in any courses yet
										</p>
										<Link href='/explore' prefetch={false}>
											<Button>Explore Courses</Button>
										</Link>
									</div>
								) : (
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										{validCoursesWithProgress.slice(0, 4).map(item => {
											if (!item || !item.course) return null

											return (
												<CourseCard
													key={
														item.enrollmentId || `enrollment-${item.course._id}`
													}
													course={item.course}
													progress={item.progress}
													href={`/dashboard/courses/${item.course._id}`}
												/>
											)
										})}
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value='bookmarks'>
							<div className='space-y-6'>
								<div className='flex items-center justify-between'>
									<h2 className='text-xl font-semibold'>Bookmarked Courses</h2>
									<Link
										href='/bookmarks'
										prefetch={false}
										className='text-primary hover:underline text-sm'
									>
										View All
									</Link>
								</div>

								{bookmarks.length === 0 ? (
									<div className='text-center py-12 bg-muted/20 rounded-lg border border-dashed'>
										<Bookmark className='mx-auto h-12 w-12 text-muted-foreground mb-3' />
										<h3 className='text-lg font-medium mb-2'>
											No bookmarks yet
										</h3>
										<p className='text-muted-foreground mb-6 max-w-md mx-auto'>
											You haven&apos;t bookmarked any courses yet
										</p>
										<Link href='/explore' prefetch={false}>
											<Button>Explore Courses</Button>
										</Link>
									</div>
								) : (
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										{bookmarks
											.slice(0, 4)
											.map(
												(bookmark: {
													_id: string
													course: GetCoursesQueryResult[number] | null
												}) => {
													if (!bookmark.course) return null

													return (
														<CourseCard
															key={bookmark._id}
															course={bookmark.course}
															href={`/courses/${bookmark.course.slug}`}
														/>
													)
												}
											)}
									</div>
								)}
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>

			{/* Learning path/recommendations section */}
			<div className='mt-12'>
				<h2 className='text-2xl font-semibold mb-6'>Recommended For You</h2>
				<div className='bg-card rounded-lg border shadow-sm p-6'>
					<p className='text-center text-muted-foreground'>
						Personalized course recommendations will appear here based on your
						learning activity.
					</p>
				</div>
			</div>
		</div>
	)
}
