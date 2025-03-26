// File: app/(user)/subscriptions/page.tsx
import { FollowInstructorButton } from '@/components/FollowInstructorButton'
import { Button } from '@/components/ui/button'
import { urlFor } from '@/sanity/lib/image'
import { getSubscribedInstructors } from '@/sanity/lib/instructor/getSubscribedInstructors'
import { currentUser } from '@clerk/nextjs/server'
import { Bell, BookOpen, GraduationCap, PlayCircle, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function SubscriptionsPage() {
	const user = await currentUser()

	if (!user?.id) {
		return redirect('/')
	}

	const instructors = await getSubscribedInstructors(user.id)

	return (
		<div className='h-full pt-16'>
			<div className='container mx-auto px-4 py-8'>
				<div className='flex items-center gap-4 mb-8'>
					<Bell className='h-8 w-8 text-primary' />
					<h1 className='text-3xl font-bold'>Subscriptions</h1>
				</div>

				<div className='mb-12'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
						<h2 className='text-2xl font-semibold'>Instructors You Follow</h2>
						<Link href='/explore' prefetch={false}>
							<Button variant='outline'>
								<Plus className='h-4 w-4 mr-2' />
								Discover Instructors
							</Button>
						</Link>
					</div>

					{instructors.length === 0 ? (
						<div className='text-center py-12 bg-muted/20 rounded-lg border border-dashed'>
							<GraduationCap className='mx-auto h-12 w-12 text-muted-foreground mb-3' />
							<h3 className='text-lg font-medium mt-4 mb-2'>
								No subscriptions yet
							</h3>
							<p className='text-muted-foreground mb-6 max-w-md mx-auto'>
								Follow your favorite instructors to get notified when they
								publish new courses
							</p>
							<Link href='/explore' prefetch={false}>
								<Button>Explore Courses</Button>
							</Link>
						</div>
					) : (
						<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
							{instructors.map(instructor => (
								<div
									key={instructor._id}
									className='bg-card rounded-lg border p-6 flex flex-col items-center text-center hover:shadow-md transition-all'
								>
									<Link
										href={`/instructor/${instructor._id}`}
										prefetch={false}
										className='group'
									>
										<div className='relative w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-background'>
											{instructor.photo ? (
												<Image
													src={urlFor(instructor.photo).url()}
													alt={instructor.name}
													fill
													className='object-cover group-hover:scale-105 transition-transform duration-300'
												/>
											) : (
												<div className='w-full h-full bg-muted flex items-center justify-center'>
													<GraduationCap className='h-10 w-10 text-muted-foreground' />
												</div>
											)}
										</div>
										<h3 className='font-semibold text-lg mb-1 group-hover:text-primary transition-colors'>
											{instructor.name}
										</h3>
									</Link>

									<p className='text-sm text-muted-foreground mb-3 line-clamp-2'>
										{instructor.bio || 'Instructor at Ed Cetera'}
									</p>

									<div className='flex items-center justify-center gap-6 text-sm mb-4'>
										<div className='flex flex-col items-center'>
											<span className='font-medium'>
												{instructor.courseCount || 0}
											</span>
											<span className='text-xs text-muted-foreground'>
												Courses
											</span>
										</div>
										<div className='flex flex-col items-center'>
											<span className='font-medium'>
												{instructor.studentCount || 0}
											</span>
											<span className='text-xs text-muted-foreground'>
												Students
											</span>
										</div>
										<div className='flex flex-col items-center'>
											<span className='font-medium'>
												{instructor.followerCount || 0}
											</span>
											<span className='text-xs text-muted-foreground'>
												Followers
											</span>
										</div>
									</div>

									<div className='mt-auto w-full'>
										<FollowInstructorButton
											instructorId={instructor._id}
											userId={user.id}
											isFollowing={true}
											variant='outline'
											size='sm'
										/>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className='mt-12'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
						<h2 className='text-2xl font-semibold'>Recent Updates</h2>
					</div>

					{instructors.length === 0 ? (
						<div className='text-center py-8 bg-muted/20 rounded-lg border border-dashed'>
							<BookOpen className='mx-auto h-12 w-12 text-muted-foreground mb-3' />
							<p className='text-muted-foreground'>
								Follow instructors to see their latest updates
							</p>
						</div>
					) : (
						<div className='space-y-4'>
							{instructors
								.filter(instructor => instructor.recentCourseSlug)
								.slice(0, 5)
								.map(instructor => (
									<div
										key={`update-${instructor._id}`}
										className='bg-card rounded-lg border p-4 hover:shadow-sm transition-all'
									>
										<div className='flex gap-4 items-start'>
											<Link
												href={`/instructor/${instructor._id}`}
												prefetch={false}
												className='relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0'
											>
												{instructor.photo ? (
													<Image
														src={urlFor(instructor.photo).url()}
														alt={instructor.name}
														fill
														className='object-cover'
													/>
												) : (
													<div className='w-full h-full bg-muted flex items-center justify-center'>
														<GraduationCap className='h-5 w-5' />
													</div>
												)}
											</Link>

											<div className='flex-1'>
												<div className='flex items-center gap-2 mb-1'>
													<Link
														href={`/instructor/${instructor._id}`}
														prefetch={false}
														className='font-medium hover:text-primary transition-colors'
													>
														{instructor.name}
													</Link>
													<span className='text-muted-foreground text-sm'>
														{instructor.recentCourseDate ||
															new Date().toLocaleDateString()}
													</span>
												</div>
												<p className='text-sm text-muted-foreground mb-2'>
													{instructor.recentActivity ||
														'Published a new course'}
												</p>
												<Link
													href={`/courses/${instructor.recentCourseSlug}`}
													prefetch={false}
													className='block'
												>
													<div className='bg-muted/40 rounded p-3 flex gap-3 items-center hover:bg-muted/60 transition-colors'>
														{instructor.recentCourseImage ? (
															<div className='relative w-10 h-10 rounded overflow-hidden'>
																<Image
																	src={urlFor(
																		instructor.recentCourseImage
																	).url()}
																	alt={instructor.recentCourse}
																	fill
																	className='object-cover'
																/>
															</div>
														) : (
															<PlayCircle className='h-8 w-8 text-primary' />
														)}
														<div>
															<p className='font-medium hover:text-primary transition-colors'>
																{instructor.recentCourse || 'New Course'}
															</p>
															<p className='text-xs text-muted-foreground'>
																Check out this course on Ed Cetera
															</p>
														</div>
													</div>
												</Link>
											</div>
										</div>
									</div>
								))}

							{instructors.length > 0 &&
								!instructors.some(
									instructor => instructor.recentCourseSlug
								) && (
									<div className='text-center py-8'>
										<p className='text-muted-foreground'>
											No recent updates from your instructors
										</p>
									</div>
								)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
