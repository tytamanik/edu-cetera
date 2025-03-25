import { CourseCard } from '@/components/CourseCard'
import { GetCoursesQueryResult } from '@/sanity.types'
import { getBookmarks } from '@/sanity/lib/bookmarks/getBookmarks'
import { getStudentByClerkId } from '@/sanity/lib/student/getStudentByClerkId'
import { currentUser } from '@clerk/nextjs/server'
import { Bookmark } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
export default async function BookmarksPage() {
	const user = await currentUser()

	if (!user?.id) {
		return redirect('/')
	}

	const student = await getStudentByClerkId(user.id)

	if (!student?.data?._id) {
		return (
			<div className='h-full pt-16'>
				<div className='container mx-auto px-4 py-8'>
					<div className='flex items-center gap-4 mb-8'>
						<Bookmark className='h-8 w-8 text-primary' />
						<h1 className='text-3xl font-bold'>Bookmarks</h1>
					</div>

					<div className='text-center py-12'>
						<h2 className='text-2xl font-semibold mb-4'>Account not found</h2>
						<p className='text-muted-foreground mb-8'>
							Your student account hasn&apos;t been set up properly.
						</p>
					</div>
				</div>
			</div>
		)
	}

	const bookmarks = await getBookmarks(student.data._id)

	return (
		<div className='h-full pt-16'>
			<div className='container mx-auto px-4 py-8'>
				<div className='flex items-center gap-4 mb-8'>
					<Bookmark className='h-8 w-8 text-primary' />
					<h1 className='text-3xl font-bold'>Bookmarks</h1>
				</div>

				{bookmarks.length === 0 ? (
					<div className='text-center py-12'>
						<h2 className='text-2xl font-semibold mb-4'>No bookmarks yet</h2>
						<p className='text-muted-foreground mb-8'>
							You haven&apos;t bookmarked any courses yet. Browse our courses
							and bookmark the ones you&apos;re interested in!
						</p>
						<Link
							href='/'
							prefetch={false}
							className='inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
						>
							Browse Courses
						</Link>
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{bookmarks.map(
							(bookmark: {
								_id: string
								course: GetCoursesQueryResult[number]
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
		</div>
	)
}
