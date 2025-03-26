// File: app/actions/categoryActions.ts
'use server'

import { getCategories } from '@/sanity/lib/categories/getCategories'

export async function getCategoriesAction() {
	try {
		const categories = await getCategories()
		return {
			success: true,
			categories: categories.map((category: any) => ({
				_id: category._id,
				name: category.name,
				slug: category.slug,
				color: category.color,
			})),
		}
	} catch (error) {
		console.error('Error fetching categories:', error)
		return {
			success: false,
			error: 'Failed to fetch categories',
		}
	}
}
