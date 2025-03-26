'use server'

import { Category, getCategories } from '@/sanity/lib/categories/getCategories'

type CategoryResponse = {
	_id: string
	name: string
	slug: string
	color?: string
}

export async function getCategoriesAction() {
	try {
		const categories = await getCategories()
		return {
			success: true,
			categories: categories.map((category: Category) => ({
				_id: category._id,
				name: category.name,
				slug: category.slug,
				color: category.color,
			})) as CategoryResponse[],
		}
	} catch (error) {
		console.error('Error fetching categories:', error)
		return {
			success: false,
			error: 'Failed to fetch categories',
		}
	}
}
