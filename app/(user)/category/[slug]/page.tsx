// Insert this file at app/(user)/category/[slug]/page.tsx

import { CourseCard } from '@/components/CourseCard'
import { GetCoursesQueryResult } from '@/sanity.types'
import { getCategoryBySlug } from '@/sanity/lib/categories/getCategoryBySlug'
import { getCoursesByCategory } from '@/sanity/lib/courses/getCoursesByCategory'
import React from 'react';

import LucideDynamicIcon from '@/components/LucideDynamicIcon';
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface CategoryPageProps {
	params: Promise<{
		slug: string
	}>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
	const { slug } = await params
	const [category, courses] = await Promise.all([
		getCategoryBySlug(slug),
		getCoursesByCategory(slug),
	])

	if (!category) {
		return notFound()
	}

	return (
		<div className='container mx-auto px-4 py-8 pt-16'>
			<div className='flex items-center justify-between mb-6'>
				<div className='flex items-center gap-4'>
					<div
						className='h-12 w-12 rounded-full flex items-center justify-center'
						style={{
							backgroundColor: category.color
								? `${category.color}20`
								: 'var(--muted)' as any,
							color: category.color || 'var(--muted-foreground)' as any,
						}}
					>
						<LucideDynamicIcon icon={category.icon} className="h-7 w-7" />
					</div>
					<div>
						<h1 className='text-3xl font-bold'>{category.name}</h1>
						<p className='text-muted-foreground'>
							{courses.length} course{courses.length !== 1 ? 's' : ''}
						</p>
					</div>
				</div>
				<Link
					href='/explore'
					prefetch={false}
					className='text-primary hover:underline'
				>
					Back to Categories
				</Link>
			</div>

			{category.description && (
				<div className='bg-muted/30 rounded-lg p-6 mb-8'>
					<p>{category.description}</p>
				</div>
			)}

			{courses.length === 0 ? (
				<div className='text-center py-12'>
					<h2 className='text-2xl font-semibold mb-4'>No courses yet</h2>
					<p className='text-muted-foreground mb-8'>
						There are no courses in this category yet. Check back later!
					</p>
					<Link
						href='/explore'
						prefetch={false}
						className='inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
					>
						Explore Other Categories
					</Link>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
					{courses.map((course: GetCoursesQueryResult[number]) => (
						<CourseCard
							key={course._id}
							course={course}
							href={`/courses/${course.slug}`}
						/>
					))}
				</div>
			)}
		</div>
	)
}
