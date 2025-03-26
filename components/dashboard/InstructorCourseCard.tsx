'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { urlFor } from '@/sanity/lib/image'
import { CheckCircle2, Edit2, Eye, Lock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Course {
	_id: string
	title?: string
	description?: string
	price?: number
	slug?: { current?: string }
	published?: boolean
	image?: {
		asset?: {
			_ref: string
		}
	}
}

interface InstructorCourseCardProps {
	course: Course
}

export default function InstructorCourseCard({
	course,
}: InstructorCourseCardProps) {
	const isPublished = !!course.published
	const courseSlug = course.slug?.current || ''

	return (
		<Card
			className={cn(
				'flex flex-col overflow-hidden transition-all duration-200',
				'hover:shadow-md',
				!isPublished && 'border-dashed'
			)}
		>
			<div className='relative h-40 w-full bg-muted'>
				{course.image ? (
					<Image
						src={urlFor(course.image).url() || ''}
						alt={course.title || 'Course image'}
						fill
						className='object-cover'
					/>
				) : (
					<div className='flex h-full w-full items-center justify-center bg-muted'>
						<div className='flex flex-col items-center'>
							<div className='rounded-full bg-background p-2'>
								<Edit2 className='h-6 w-6 text-muted-foreground' />
							</div>
							<p className='mt-2 text-sm text-muted-foreground'>No image yet</p>
						</div>
					</div>
				)}

				<div className='absolute top-2 right-2'>
					{isPublished ? (
						<Badge
							variant='secondary'
							className='bg-green-500/10 text-green-600 hover:bg-green-500/20'
						>
							<CheckCircle2 className='mr-1 h-3 w-3' />
							Published
						</Badge>
					) : (
						<Badge
							variant='secondary'
							className='bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
						>
							<Lock className='mr-1 h-3 w-3' />
							Draft
						</Badge>
					)}
				</div>
			</div>

			<CardHeader className='pb-2'>
				<CardTitle className='line-clamp-1 text-xl'>
					{course.title || 'Untitled Course'}
				</CardTitle>
				<CardDescription className='line-clamp-2'>
					{course.description || 'No description yet'}
				</CardDescription>
			</CardHeader>

			<CardContent className='pb-2'>
				<div className='text-sm text-muted-foreground'>
					{course.price !== undefined && course.price > 0 ? (
						<span className='font-medium'>${course.price.toFixed(2)}</span>
					) : (
						<span>Free</span>
					)}
				</div>
			</CardContent>

			<CardFooter className='grid grid-cols-2 gap-2 pt-2 mt-auto'>
				<Button asChild variant='outline' size='sm'>
					<Link href={`/courses/${courseSlug}`} prefetch={false}>
						<Eye className='mr-2 h-4 w-4' />
						Preview
					</Link>
				</Button>
				<Button asChild variant='default' size='sm'>
					<Link
						href={`/creator-dashboard/courses/${course._id}/edit`}
						prefetch={false}
					>
						<Edit2 className='mr-2 h-4 w-4' />
						Edit
					</Link>
				</Button>
			</CardFooter>
		</Card>
	)
}
