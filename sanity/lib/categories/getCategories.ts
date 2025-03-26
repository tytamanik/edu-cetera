import { client } from '../client'

export interface Category {
	_id: string
	name: string
	slug: string
	description?: string
	icon?: string
	color?: string
}

export async function getCategories(): Promise<Category[]> {
	const query = `*[_type == "category"] {
    _id,
    name,
    "slug": slug.current,
    description,
    icon,
    color
  }`

	try {
		const categories = await client.fetch<Category[]>(query)
		return categories || []
	} catch (error) {
		console.error('Error fetching categories:', error)
		return []
	}
}
