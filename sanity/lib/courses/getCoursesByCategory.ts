// File: sanity/lib/courses/getCoursesByCategory.ts
import { defineQuery } from 'groq'
import { sanityFetch } from '../live'

export async function getCoursesByCategory(categorySlug: string) {
	try {
		// First, ensure the category exists
		const categoryQuery = defineQuery(
			`*[_type == "category" && slug.current == $categorySlug][0]._id`
		)
		const categoryResult = await sanityFetch({
			query: categoryQuery,
			params: { categorySlug },
		})

		if (!categoryResult.data) {
			return []
		}

		// Then fetch courses for that category
		const getCoursesByCategoryQuery =
			defineQuery(`*[_type == "course" && published == true && category._ref == $categoryId] {
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
    } | order(enrollmentCount desc)`)

		const coursesResult = await sanityFetch({
			query: getCoursesByCategoryQuery,
			params: { categoryId: categoryResult.data },
		})

		return coursesResult.data || []
	} catch (error) {
		console.error(`Error fetching courses for category ${categorySlug}:`, error)
		return []
	}
}
