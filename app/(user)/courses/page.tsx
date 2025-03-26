import { CourseCard } from '@/components/CourseCard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GetCoursesQueryResult } from '@/sanity.types'
import { getCategories } from '@/sanity/lib/categories/getCategories'
import {
	CourseFilters,
	getAllCourses,
} from '@/sanity/lib/courses/getAllCourses'
import { BookOpen, Clock, Filter, SortAsc, TrendingUp } from 'lucide-react'
import Link from 'next/link'
export const dynamic = 'force-dynamic'

export default async function CoursesPage(props: any) {
	const { searchParams = {} } = props

	const sort = (searchParams.sort as string) || 'popular'
	const categoryParam = searchParams.category as string | string[]
	const categories = Array.isArray(categoryParam)
		? categoryParam
		: categoryParam
			? [categoryParam]
			: []
	const isFree = searchParams.free === 'true'
	const isPaid = searchParams.paid === 'true'
	const priceRange = searchParams.priceRange as string

	let priceRangeFilter = undefined
	if (priceRange) {
		const [min, max] = priceRange.split('-').map(Number)
		priceRangeFilter = {
			min: isNaN(min) ? undefined : min,
			max: isNaN(max) ? undefined : max,
		}
	}

	const filters: CourseFilters = {
		categories: categories,
		isFree: isFree,
		isPaid: isPaid,
		priceRange: priceRangeFilter,
	}

	const [courses, categoriesData] = await Promise.all([
		getAllCourses(filters, sort),
		getCategories(),
	])

	const activeFilterCount =
		(categories.length > 0 ? 1 : 0) +
		(isFree ? 1 : 0) +
		(isPaid ? 1 : 0) +
		(priceRange ? 1 : 0)

	const getFilterUrl = (
		params: Record<string, string | string[] | boolean | null>
	) => {
		const urlParams = new URLSearchParams()

		if (sort) {
			urlParams.set('sort', sort)
		}

		if (priceRange && !params.hasOwnProperty('priceRange')) {
			urlParams.set('priceRange', priceRange)
		}

		if (isFree && !params.hasOwnProperty('free')) {
			urlParams.set('free', 'true')
		}

		if (isPaid && !params.hasOwnProperty('paid')) {
			urlParams.set('paid', 'true')
		}

		Object.entries(params).forEach(([key, value]) => {
			if (value === null) {
				urlParams.delete(key)
			} else if (Array.isArray(value)) {
				urlParams.delete(key)
				value.forEach(val => urlParams.append(key, val))
			} else if (typeof value === 'boolean') {
				urlParams.set(key, value.toString())
			} else {
				urlParams.set(key, value)
			}
		})

		return `/courses?${urlParams.toString()}`
	}

	const isCategoryActive = (categorySlug: string) => {
		return categories.includes(categorySlug)
	}

	const toggleCategory = (categorySlug: string) => {
		if (isCategoryActive(categorySlug)) {
			return getFilterUrl({
				category: categories.filter(c => c !== categorySlug),
			})
		} else {
			return getFilterUrl({
				category: [...categories, categorySlug],
			})
		}
	}

	const clearAllFilters = () => {
		return getFilterUrl({
			category: null,
			free: null,
			paid: null,
			priceRange: null,
		})
	}

	const priceRangeOptions = [
		{ label: 'Under $20', value: '0-20' },
		{ label: '$20 to $50', value: '20-50' },
		{ label: '$50 to $100', value: '50-100' },
		{ label: 'Over $100', value: '100-1000' },
	]

	return (
		<div className='container mx-auto px-4 py-8 pt-16'>
			<div className='flex items-center gap-4 mb-8'>
				<BookOpen className='h-8 w-8 text-primary' />
				<div>
					<h1 className='text-3xl font-bold'>All Courses</h1>
					<p className='text-muted-foreground'>
						Browse our catalog of {courses.length} courses
					</p>
				</div>
			</div>

			<div className='flex flex-col md:flex-row gap-6'>
				<div className='md:w-64 space-y-6'>
					<div className='bg-card rounded-lg border p-4'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='font-medium flex items-center gap-2'>
								<Filter className='h-4 w-4' />
								Filters
								{activeFilterCount > 0 && (
									<span className='ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary text-white'>
										{activeFilterCount}
									</span>
								)}
							</h3>
							<Link href={clearAllFilters()}>
								<Button variant='ghost' size='sm' className='h-8 text-xs'>
									Clear All
								</Button>
							</Link>
						</div>

						<div className='space-y-4'>
							<div>
								<h4 className='text-sm font-medium mb-2'>Categories</h4>
								<div className='space-y-2'>
									{categoriesData.map(category => (
										<div key={category._id} className='flex items-center'>
											<input
												type='checkbox'
												id={`category-${category.slug}`}
												className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
												checked={isCategoryActive(category.slug)}
												readOnly
											/>
											<Link
												href={toggleCategory(category.slug)}
												className='ml-2 text-sm text-gray-700 dark:text-gray-300 hover:text-primary'
											>
												{category.name}
											</Link>
										</div>
									))}
								</div>
							</div>

							<div>
								<h4 className='text-sm font-medium mb-2'>Price</h4>
								<div className='space-y-2'>
									<div className='flex items-center'>
										<input
											type='checkbox'
											id='price-free'
											className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
											checked={isFree}
											readOnly
										/>
										<Link
											href={getFilterUrl({ free: !isFree })}
											className='ml-2 text-sm text-gray-700 dark:text-gray-300 hover:text-primary'
										>
											Free
										</Link>
									</div>
									<div className='flex items-center'>
										<input
											type='checkbox'
											id='price-paid'
											className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
											checked={isPaid}
											readOnly
										/>
										<Link
											href={getFilterUrl({ paid: !isPaid })}
											className='ml-2 text-sm text-gray-700 dark:text-gray-300 hover:text-primary'
										>
											Paid
										</Link>
									</div>
								</div>
							</div>

							<div>
								<h4 className='text-sm font-medium mb-2'>Price Range</h4>
								<div className='space-y-2'>
									{priceRangeOptions.map(range => (
										<div key={range.value} className='flex items-center'>
											<input
												type='checkbox'
												id={`price-range-${range.value}`}
												className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
												checked={priceRange === range.value}
												readOnly
											/>
											<Link
												href={getFilterUrl({
													priceRange:
														priceRange === range.value ? null : range.value,
												})}
												className='ml-2 text-sm text-gray-700 dark:text-gray-300 hover:text-primary'
											>
												{range.label}
											</Link>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='flex-1'>
					<div className='mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
						<Tabs defaultValue={sort} className='w-full sm:w-auto'>
							<TabsList>
								<TabsTrigger value='popular' asChild>
									<Link
										href={getFilterUrl({ sort: 'popular' })}
										prefetch={false}
									>
										<TrendingUp className='h-4 w-4 mr-2' />
										Popular
									</Link>
								</TabsTrigger>
								<TabsTrigger value='newest' asChild>
									<Link
										href={getFilterUrl({ sort: 'newest' })}
										prefetch={false}
									>
										<Clock className='h-4 w-4 mr-2' />
										Newest
									</Link>
								</TabsTrigger>
								<TabsTrigger value='price-low' asChild>
									<Link
										href={getFilterUrl({ sort: 'price-low' })}
										prefetch={false}
									>
										<SortAsc className='h-4 w-4 mr-2' />
										Price: Low to High
									</Link>
								</TabsTrigger>
								<TabsTrigger value='price-high' asChild>
									<Link
										href={getFilterUrl({ sort: 'price-high' })}
										prefetch={false}
									>
										<SortAsc className='h-4 w-4 mr-2 rotate-180' />
										Price: High to Low
									</Link>
								</TabsTrigger>
							</TabsList>
						</Tabs>

						<p className='text-sm text-muted-foreground'>
							Showing {courses.length} results
						</p>
					</div>

					{courses.length === 0 ? (
						<div className='text-center py-12 bg-muted/20 rounded-lg border border-dashed'>
							<BookOpen className='mx-auto h-12 w-12 text-muted-foreground mb-3' />
							<h3 className='text-lg font-medium mb-2'>No courses found</h3>
							<p className='text-muted-foreground mb-6 max-w-md mx-auto'>
								We couldn&apos;t find any courses that match your selected
								filters.
							</p>
							<Link href='/courses'>
								<Button>View All Courses</Button>
							</Link>
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
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
			</div>
		</div>
	)
}
