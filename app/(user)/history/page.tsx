// File: app/(user)/history/page.tsx
import { getLessonCompletionHistory } from '@/sanity/lib/lessons/getLessonCompletionHistory'
import { currentUser } from '@clerk/nextjs/server'
import { History } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function HistoryPage() {
	const user = await currentUser()

	if (!user?.id) {
		return redirect('/')
	}

	const completions = await getLessonCompletionHistory(user.id)

	return (
		<div className='h-full pt-16'>
			<div className='container mx-auto px-4 py-8'>
				<div className='flex items-center gap-4 mb-8'>
					<History className='h-8 w-8 text-primary' />
					<div>
						<h1 className='text-3xl font-bold'>Learning History</h1>
						<p className='text-muted-foreground'>
							Track your progress and revisit completed lessons
						</p>
					</div>
				</div>

				{completions.length === 0 ? (
					<div className='text-center py-12 bg-card rounded-lg border shadow-sm'>
						<History className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
						<h2 className='text-2xl font-semibold mb-4'>
							No learning history yet
						</h2>
						<p className='text-muted-foreground mb-8 max-w-md mx-auto'>
							As you complete lessons, they&apos;ll appear here so you can
							easily track your progress.
						</p>
						<Link
							href='/my-courses'
							prefetch={false}
							className='inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
						>
							Go to My Courses
						</Link>
					</div>
				) : (
					<div className='bg-card rounded-lg border shadow-sm overflow-hidden'>
						<div className='grid grid-cols-[1fr,2fr,1fr] md:grid-cols-[1fr,2fr,1fr,1fr] p-4 border-b font-medium text-muted-foreground'>
							<div>Date</div>
							<div>Lesson</div>
							<div className='hidden md:block'>Course</div>
							<div className='text-right'>View Lesson</div>
						</div>

						<div className='divide-y'>
							{completions.map(completion => (
								<div
									key={completion._id}
									className='grid grid-cols-[1fr,2fr,1fr] md:grid-cols-[1fr,2fr,1fr,1fr] p-4 items-center hover:bg-muted/30 transition-colors'
								>
									<div className='text-sm text-muted-foreground'>
										{new Date(completion.completedAt).toLocaleDateString()}
									</div>

									<div>
										<div className='font-medium'>{completion.lesson.title}</div>
										<div className='text-sm text-muted-foreground'>
											Module: {completion.module.title}
										</div>
									</div>

									<div className='hidden md:flex items-center gap-2'>
										{completion.course.imageUrl ? (
											<div className='relative w-10 h-10 rounded overflow-hidden flex-shrink-0'>
												<Image
													src={completion.course.imageUrl}
													alt={completion.course.title}
													fill
													className='object-cover'
												/>
											</div>
										) : (
											<div className='w-10 h-10 bg-muted flex items-center justify-center rounded flex-shrink-0'>
												<History className='h-5 w-5 text-muted-foreground' />
											</div>
										)}
										<span className='text-sm line-clamp-1'>
											{completion.course.title}
										</span>
									</div>

									<div className='text-right'>
										<Link
											href={`/dashboard/courses/${completion.course._id}/lessons/${completion.lesson._id}`}
											prefetch={false}
											className='text-primary hover:underline text-sm'
										>
											View Lesson
										</Link>
									</div>
								</div>
							))}
						</div>

						{completions.length > 10 && (
							<div className='flex justify-center p-4 border-t'>
								<span className='text-sm text-muted-foreground'>
									Showing your {completions.length} most recent completed
									lessons
								</span>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
