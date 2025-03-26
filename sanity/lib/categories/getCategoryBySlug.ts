// File: sanity/lib/categories/getCategoryBySlug.ts
import { defineQuery } from 'groq'
import { sanityFetch } from '../live'

export async function getCategoryBySlug(slug: string) {
	try {
		const getCategoryBySlugQuery =
			defineQuery(`*[_type == "category" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      description,
      icon,
      color,
      "courseCount": count(*[_type == "course" && published == true && category._ref == ^._id])
    }`)

		const result = await sanityFetch({
			query: getCategoryBySlugQuery,
			params: { slug },
		})

		return result.data
	} catch (error) {
		console.error(`Error fetching category with slug ${slug}:`, error)
		return null
	}
}
