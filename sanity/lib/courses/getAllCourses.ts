// File: sanity/lib/courses/getAllCourses.ts - Replace the entire content of this file
import { defineQuery } from 'groq'
import { sanityFetch } from '../live'

export interface CourseFilters {
	categories?: string[]
	priceRange?: {
		min?: number
		max?: number
	}
	isFree?: boolean
	isPaid?: boolean
	instructorId?: string
	search?: string
}

export async function getAllCourses(filters?: CourseFilters, sort?: string) {
	try {
		// Build filter conditions
		const filterConditions = [`_type == "course" && published == true`]

		if (filters) {
			if (filters.categories && filters.categories.length > 0) {
				// Get category IDs by slug and filter courses by them
				filterConditions.push(`category->slug.current in $categorySlugs`)
			}

			if (filters.instructorId) {
				filterConditions.push(`instructor._ref == $instructorId`)
			}

			if (filters.isFree) {
				filterConditions.push(`(price == 0 || price == null)`)
			}

			if (filters.isPaid) {
				filterConditions.push(`price > 0`)
			}

			if (filters.priceRange) {
				if (filters.priceRange.min !== undefined) {
					filterConditions.push(`price >= ${filters.priceRange.min}`)
				}
				if (filters.priceRange.max !== undefined) {
					filterConditions.push(`price <= ${filters.priceRange.max}`)
				}
			}

			if (filters.search) {
				filterConditions.push(
					`(title match $searchTerm || description match $searchTerm || category->name match $searchTerm || instructor->name match $searchTerm)`
				)
			}
		}

		// Build order by clause
		let orderBy = 'title asc'
		if (sort) {
			switch (sort) {
				case 'newest':
					orderBy = '_createdAt desc'
					break
				case 'oldest':
					orderBy = '_createdAt asc'
					break
				case 'price-low':
					orderBy = 'price asc'
					break
				case 'price-high':
					orderBy = 'price desc'
					break
				case 'popular':
				default:
					orderBy = 'enrollmentCount desc'
					break
			}
		}

		// Build the query
		const queryString = `*[${filterConditions.join(' && ')}] {
      ...,
      "slug": slug.current,
      "category": category->{
        _id,
        name,
        "slug": slug.current,
        color,
        icon
      },
      "instructor": instructor->{
        _id,
        name,
        bio,
        photo
      },
      "enrollmentCount": count(*[_type == "enrollment" && course._ref == ^._id])
    } | order(${orderBy})`

		const allCoursesQuery = defineQuery(queryString)

		// Prepare params object
		const params: Record<string, any> = {}

		if (filters?.categories?.length) {
			params.categorySlugs = filters.categories
		}

		if (filters?.instructorId) {
			params.instructorId = filters.instructorId
		}

		if (filters?.search) {
			params.searchTerm = filters.search + '*'
		}

		const result = await sanityFetch({
			query: allCoursesQuery,
			params,
		})

		return result.data || []
	} catch (error) {
		console.error('Error fetching all courses:', error)
		return []
	}
}
