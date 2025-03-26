import { defineQuery } from 'groq'
import { sanityFetch } from '../live'

export interface Category {
	_id: string
	name: string
	slug: {
		current: string
	}
	description?: string
	icon?: string
	color?: string
}

export async function getCategories() {
	const getCategoriesQuery = defineQuery(`*[_type == "category"] {
    _id,
    name,
    "slug": slug.current,
    description,
    icon,
    color
  }`)

	const result = await sanityFetch({
		query: getCategoriesQuery,
	})

	return result.data || []
}
