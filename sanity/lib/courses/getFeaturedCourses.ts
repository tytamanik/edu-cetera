// File: sanity/lib/courses/getFeaturedCourses.ts
import { defineQuery } from 'groq'
import { sanityFetch } from '../live'

export async function getFeaturedCourses(limit = 6) {
	try {
		// Get courses with highest enrollment counts, which we'll consider as "featured"
		const featuredCoursesQuery =
			defineQuery(`*[_type == "course" && published == true] {
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
    } | order(enrollmentCount desc)[0...${limit}]`)

		const result = await sanityFetch({
			query: featuredCoursesQuery,
		})

		return result.data || []
	} catch (error) {
		console.error('Error fetching featured courses:', error)
		return []
	}
}

// Get newest courses
export async function getNewestCourses(limit = 3) {
	try {
		const newestCoursesQuery =
			defineQuery(`*[_type == "course" && published == true] {
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
      }
    } | order(_createdAt desc)[0...${limit}]`)

		const result = await sanityFetch({
			query: newestCoursesQuery,
		})

		return result.data || []
	} catch (error) {
		console.error('Error fetching newest courses:', error)
		return []
	}
}

// Get popular categories with course counts
export async function getPopularCategories(limit = 5) {
	try {
		const popularCategoriesQuery = defineQuery(`*[_type == "category"] {
      _id,
      name,
      "slug": slug.current,
      description,
      color,
      icon,
      "courseCount": count(*[_type == "course" && published == true && category._ref == ^._id])
    } | order(courseCount desc)[0...${limit}]`)

		const result = await sanityFetch({
			query: popularCategoriesQuery,
		})

		return result.data || []
	} catch (error) {
		console.error('Error fetching popular categories:', error)
		return []
	}
}
