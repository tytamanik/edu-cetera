// sanity/lib/categories/getCategoryIdBySlug.ts
// Get category ID by slug

import groq from 'groq'
import { client } from '../adminClient'

export async function getCategoryIdBySlug(
	slug: string
): Promise<string | null> {
	try {
		const query = groq`*[_type == "category" && slug.current == $slug][0]._id`
		const categoryId = await client.fetch(query, { slug })
		return categoryId
	} catch (error) {
		console.error('Error fetching category by slug:', error)
		return null
	}
}
