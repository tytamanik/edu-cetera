'use client'

import { CourseProgress } from '@/components/CourseProgress'
import { Loader } from '@/components/ui/loader'
import {
	GetCoursesQueryResult,
	GetEnrolledCoursesQueryResult,
} from '@/sanity.types'
import { urlFor } from '@/sanity/lib/image'
import { BookOpen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface CourseCardProps {
	course:
		| GetCoursesQueryResult[number]
		| NonNullable<
				NonNullable<GetEnrolledCoursesQueryResult>['enrolledCourses'][number]['course']
		  >
	progress?: number
	href: string
}

export function CourseCard({ course, progress, href }: CourseCardProps) {
	const [imageError, setImageError] = useState(false)
	const [isImageLoading, setIsImageLoading] = useState(true)

	return (
		<Link
			href={href}
			prefetch={false}
			className='group hover:no-underline flex'
		>
			<div className='bg-card rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:translate-y-[-4px] border border-border flex flex-col flex-1'>
				<div className='relative h-52 w-full overflow-hidden'>
					{course.image && !imageError ? (
						<>
							<Image
								src={urlFor(course.image).url() || ''}
								alt={course.title || 'Course Image'}
								fill
								className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
									isImageLoading ? 'opacity-0' : 'opacity-100'
								}`}
								onLoad={() => setIsImageLoading(false)}
								onError={() => {
									setImageError(true)
									setIsImageLoading(false)
								}}
							/>
							{isImageLoading && (
								<div className='absolute inset-0 flex items-center justify-center bg-muted'>
									<Loader size='lg' />
								</div>
							)}
						</>
					) : (
						<div className='h-full w-full flex items-center justify-center bg-muted'>
							<div className='text-center'>
								<BookOpen className='mx-auto h-10 w-10 text-muted-foreground mb-2' />
								<span className='text-sm text-muted-foreground'>
									{imageError ? 'Failed to load image' : 'No image available'}
								</span>
							</div>
						</div>
					)}
					<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300' />
					<div className='absolute bottom-4 left-4 right-4 flex items-center justify-between'>
						<span className='text-sm font-medium px-3 py-1 bg-black/50 text-white rounded-full backdrop-blur-sm'>
							{course.category?.name || 'Uncategorized'}
						</span>
						{'price' in course && typeof course.price === 'number' && (
							<span className='text-white font-bold px-3 py-1 bg-black/50 dark:bg-white/20 rounded-full backdrop-blur-sm'>
								{course.price === 0
									? 'Free'
									: `$${course.price.toLocaleString('en-US', {
											minimumFractionDigits: 2,
										})}`}
							</span>
						)}
					</div>
				</div>
				<div className='p-6 flex flex-col flex-1'>
					<h3 className='text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300'>
						{course.title}
					</h3>
					<p className='text-muted-foreground mb-4 line-clamp-2 flex-1'>
						{course.description}
					</p>
					<div className='space-y-4 mt-auto'>
						{course.instructor && (
							<div className='flex items-center justify-between'>
								<div className='flex items-center'>
									{course.instructor.photo ? (
										<div className='relative h-8 w-8 mr-2 rounded-full overflow-hidden bg-muted'>
											<Image
												src={urlFor(course.instructor.photo).url() || ''}
												alt={course.instructor.name || 'Instructor'}
												fill
												className='object-cover'
												onError={e => {
													e.currentTarget.src =
														"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E"
												}}
											/>
										</div>
									) : (
										<div className='h-8 w-8 mr-2 rounded-full bg-muted flex items-center justify-center text-muted-foreground'>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width='18'
												height='18'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<path d='M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3' />
												<circle cx='12' cy='10' r='3' />
												<circle cx='12' cy='12' r='10' />
											</svg>
										</div>
									)}
									<span className='text-sm text-muted-foreground'>
										by {course.instructor.name}
									</span>
								</div>
								<BookOpen className='h-4 w-4 text-muted-foreground' />
							</div>
						)}
						{typeof progress === 'number' && (
							<CourseProgress
								progress={progress}
								variant='default'
								size='sm'
								label='Course Progress'
							/>
						)}
					</div>
				</div>
			</div>
		</Link>
	)
}
