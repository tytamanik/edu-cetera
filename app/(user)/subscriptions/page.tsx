// File: app/(user)/subscriptions/page.tsx
import { Button } from '@/components/ui/button'
import { urlFor } from '@/sanity/lib/image'
import { getSubscribedInstructors } from '@/sanity/lib/instructor/getSubscribedInstructors'
import { currentUser } from '@clerk/nextjs/server'
import { Bell, GraduationCap, PlayCircle, Plus } from 'lucide-react'
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

				<div className='mb-8'>
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
								<Link
									key={instructor._id}
									href={`/instructor/${instructor._id}`}
									prefetch={false}
									className='bg-card rounded-lg border p-6 flex flex-col items-center text-center hover:shadow-md transition-all'
								>
									<div className='relative w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-background'>
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
									</div>
									<h3 className='font-semibold text-lg mb-1'>
										{instructor.name}
									</h3>
									<p className='text-sm text-muted-foreground mb-3 line-clamp-2'>
										{instructor.bio || 'Instructor at Ed Cetera'}
									</p>
									<div className='text-sm'>
										<span className='font-medium'>
											{instructor.courseCount}
										</span>
										<span className='text-muted-foreground ml-1'>courses</span>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>

				<div className='mt-12'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
						<h2 className='text-2xl font-semibold'>Recent Updates</h2>
					</div>

					{instructors.length === 0 ? (
						<div className='text-center py-8'>
							<p className='text-muted-foreground'>
								Follow instructors to see their latest updates
							</p>
						</div>
					) : (
						<div className='space-y-4'>
							{instructors.slice(0, 3).map(instructor => (
								<div
									key={`update-${instructor._id}`}
									className='bg-card rounded-lg border p-4 flex gap-4 items-start hover:shadow-sm transition-all'
								>
									<div className='relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0'>
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
									</div>
									<div className='flex-1'>
										<div className='flex items-center gap-2 mb-1'>
											<h4 className='font-medium'>{instructor.name}</h4>
											<span className='text-muted-foreground text-sm'>
												{new Date().toLocaleDateString()}
											</span>
										</div>
										<p className='text-sm text-muted-foreground mb-2'>
											{instructor.recentActivity || 'Published a new course'}
										</p>
										<div className='bg-muted/40 rounded p-3 flex gap-3 items-center'>
											<PlayCircle className='h-8 w-8 text-primary' />
											<div>
												<p className='font-medium'>
													{instructor.recentCourse || 'New Course'}
												</p>
												<p className='text-xs text-muted-foreground'>
													Check out my latest course on Ed Cetera
												</p>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
