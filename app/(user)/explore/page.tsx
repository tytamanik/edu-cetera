// File: app/(user)/explore/page.tsx
import { CourseCard } from '@/components/CourseCard'
import { getCategories } from '@/sanity/lib/categories/getCategories'
import { searchCourses } from '@/sanity/lib/courses/searchCourses'
import {
	BookOpen,
	Briefcase,
	Camera,
	Code,
	Compass,
	Globe,
	PenTool,
} from 'lucide-react'
import Link from 'next/link'

// Mapping of category names to icons
const categoryIcons = {
	Technology: Code,
	Business: Briefcase,
	Design: PenTool,
	Marketing: Globe,
	Photography: Camera,
	'Web Development': Code,
	Entrepreneurship: Briefcase,
	'Graphic Design': PenTool,
	'Digital Marketing': Globe,
	// Add more mappings as needed
	default: BookOpen,
}

export default async function ExplorePage() {
	const categories = await getCategories()
	const courses = await searchCourses('')

	return (
		<div className='container mx-auto px-4 py-8 pt-16'>
			<div className='flex items-center gap-4 mb-8'>
				<Compass className='h-8 w-8 text-primary' />
				<h1 className='text-3xl font-bold'>Explore Courses</h1>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8'>
				{categories.map(category => {
					// Find the appropriate icon, default to BookOpen if not found
					const CategoryIcon =
						categoryIcons[category.name] || categoryIcons['default']

					return (
						<Link
							key={category._id}
							href={`/category/${category.slug.current}`}
							className='group'
						>
							<div className='bg-card border rounded-lg p-4 hover:shadow-md transition-all hover:border-primary/50 hover:bg-muted/20'>
								<div
									className='w-12 h-12 rounded-full mb-4 flex items-center justify-center'
									style={{
										backgroundColor: category.color
											? `${category.color}10`
											: 'bg-muted/50',
										color: category.color || 'text-muted-foreground',
									}}
								>
									<CategoryIcon className='h-6 w-6' />
								</div>
								<h3 className='text-lg font-semibold group-hover:text-primary transition-colors'>
									{category.name}
								</h3>
								<p className='text-sm text-muted-foreground'>
									{category.description || 'Explore courses in this category'}
								</p>
							</div>
						</Link>
					)
				})}
			</div>

			<div>
				<h2 className='text-2xl font-bold mb-6'>All Courses</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
					{courses.map(course => (
						<CourseCard
							key={course._id}
							course={course}
							href={`/courses/${course.slug}`}
						/>
					))}
				</div>
			</div>
		</div>
	)
}
