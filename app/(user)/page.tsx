import { CourseCard } from '@/components/CourseCard'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { GetCoursesQueryResult } from '@/sanity.types'
import {
	getFeaturedCourses,
	getNewestCourses,
	getPopularCategories,
} from '@/sanity/lib/courses/getFeaturedCourses'
import React from 'react';

// Removed categoryIconMap. Using LucideDynamicIcon everywhere for categories.
import { BookOpen, Compass, GraduationCap, Star } from 'lucide-react';
import LucideDynamicIcon from '@/components/LucideDynamicIcon';
import Link from 'next/link'
export const revalidate = 3600

export default async function Home() {
	const [featuredCourses, newestCourses, popularCategories] = await Promise.all(
		[getFeaturedCourses(6), getNewestCourses(3), getPopularCategories(5)]
	)
	type CategoryWithCount = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  courseCount: number;
};
	return (
		<div className='pb-20 sm:pb-6'>
			<Hero />

			<section className='container mx-auto px-4 py-12'>
				<div className='flex flex-col md:flex-row md:items-center md:justify-between mb-8'>
					<div>
						<h2 className='text-3xl font-bold'>Featured Courses</h2>
						<p className='text-muted-foreground mt-2'>
							Expand your knowledge with our most popular courses
						</p>
					</div>
					<Link href='/explore' prefetch={false} className='mt-4 md:mt-0'>
						<Button variant='outline'>
							<Compass className='mr-2 h-4 w-4' />
							Explore All Courses
						</Button>
					</Link>
				</div>

				{featuredCourses.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{featuredCourses.map((course: GetCoursesQueryResult[number]) => (
							<CourseCard
								key={course._id}
								course={course}
								href={`/courses/${course.slug}`}
							/>
						))}
					</div>
				) : (
					<div className='text-center py-12 bg-muted/20 rounded-lg border border-dashed'>
						<BookOpen className='mx-auto h-12 w-12 text-muted-foreground mb-3' />
						<h3 className='text-lg font-medium mb-2'>
							No featured courses yet
						</h3>
						<p className='text-muted-foreground mb-6 max-w-md mx-auto'>
							We&apos;re working on adding more courses. Check back soon!
						</p>
					</div>
				)}
			</section>

			{/* Categories Section */}
			<section className='bg-muted/30 py-12'>
				<div className='container mx-auto px-4'>
					<div className='text-center mb-10'>
						<h2 className='text-3xl font-bold mb-2'>Browse by Category</h2>
						<p className='text-muted-foreground max-w-2xl mx-auto'>
							Explore our wide range of courses across different categories to
							find the perfect match for your learning goals
						</p>
					</div>

					{popularCategories.length > 0 ? (
						<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8'>
							{popularCategories.map((category: CategoryWithCount) => (
								<Link
									key={category._id}
									href={`/category/${category.slug}`}
									prefetch={false}
									className='flex flex-col items-center justify-center p-6 rounded-lg bg-background border hover:shadow-md transition-all hover:border-primary'
								>
									<div className='p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
										<LucideDynamicIcon icon={category.icon} className="h-8 w-8" />
									</div>
									<span className='font-medium text-center'>
										{category.name}
									</span>
									<span className='text-xs text-muted-foreground mt-1'>
										{category.courseCount} course
										{category.courseCount !== 1 ? 's' : ''}
									</span>
								</Link>
							))}
						</div>
					) : (
						<div className='text-center py-8 mb-4'>
							<p className='text-muted-foreground'>
								Categories will appear here soon!
							</p>
						</div>
					)}

					<div className='text-center'>
						<Link href='/explore' prefetch={false}>
							<Button>View All Categories</Button>
						</Link>
					</div>
				</div>
			</section>

			<section className='container mx-auto px-4 py-12'>
				<div className='flex flex-col md:flex-row md:items-center md:justify-between mb-8'>
					<div>
						<h2 className='text-3xl font-bold'>New Releases</h2>
						<p className='text-muted-foreground mt-2'>
							Check out our latest courses fresh from our instructors
						</p>
					</div>
					<Link
						href='/courses?sort=newest'
						prefetch={false}
						className='mt-4 md:mt-0'
					>
						<Button variant='outline'>View All New Courses</Button>
					</Link>
				</div>

				{newestCourses.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
						{newestCourses.map((course: GetCoursesQueryResult[number]) => (
							<CourseCard
								key={course._id}
								course={course}
								href={`/courses/${course.slug}`}
							/>
						))}
					</div>
				) : (
					<div className='text-center py-8'>
						<p className='text-muted-foreground'>
							New courses will appear here soon!
						</p>
					</div>
				)}
			</section>

			{/* Features Section */}
			<section className='container mx-auto px-4 py-16'>
				<div className='text-center mb-12'>
					<h2 className='text-3xl font-bold mb-2'>Why Choose Ed Cetera</h2>
					<p className='text-muted-foreground max-w-2xl mx-auto'>
						Our platform offers a unique learning experience with features
						designed to help you succeed
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
					<div className='bg-card p-6 rounded-lg border shadow-sm'>
						<div className='p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
							<GraduationCap className='h-8 w-8 text-primary' />
						</div>
						<h3 className='text-xl font-bold mb-2'>Expert Instructors</h3>
						<p className='text-muted-foreground'>
							Learn from industry professionals with real-world experience and
							expertise in their fields
						</p>
					</div>

					<div className='bg-card p-6 rounded-lg border shadow-sm'>
						<div className='p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
							<Star className='h-8 w-8 text-primary' />
						</div>
						<h3 className='text-xl font-bold mb-2'>Quality Content</h3>
						<p className='text-muted-foreground'>
							Access high-quality courses with structured curriculum, quizzes,
							and practical exercises
						</p>
					</div>

					<div className='bg-card p-6 rounded-lg border shadow-sm'>
						<div className='p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4'>
							<BookOpen className='h-8 w-8 text-primary' />
						</div>
						<h3 className='text-xl font-bold mb-2'>Learn at Your Pace</h3>
						<p className='text-muted-foreground'>
							Progress through courses at your own speed with lifetime access to
							all course materials
						</p>
					</div>
				</div>
			</section>

			<section className="bg-gradient-to-r from-primary/90 to-primary py-16 dark:from-primary/80 dark:to-primary/60">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white dark:text-gray-100">Ready to Start Learning?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-white/90 dark:text-gray-200">
            Join thousands of students and expand your knowledge with our courses today
          </p>
          <Link href='/explore' prefetch={false}>
            <Button variant='secondary' size='lg'>
              <Compass className='mr-2 h-5 w-5' />
              Explore Courses
            </Button>
          </Link>
        </div>
      </section>
		</div>
	)
}
