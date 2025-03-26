// File: components/dashboard/ClientCategories.tsx
'use client'

import { getCategoriesAction } from '@/app/actions/categoryActions'
import { useEffect, useState } from 'react'
import CategorySelect from './CategorySelect'

interface Category {
	_id: string
	name: string
	slug: string
	color?: string
	icon?: string
}

interface ClientCategoriesProps {
	initialCategories?: Category[]
	onCategoryChange: (category: string) => void
	selectedCategory: string
	className?: string
}

export default function ClientCategories({
	initialCategories = [],
	onCategoryChange,
	selectedCategory,
	className,
}: ClientCategoriesProps) {
	const [categories, setCategories] = useState<Category[]>(initialCategories)
	const [isLoading, setIsLoading] = useState(initialCategories.length === 0)

	useEffect(() => {
		if (initialCategories.length === 0) {
			const fetchCategories = async () => {
				try {
					setIsLoading(true)
					const result = await getCategoriesAction()

					if (result.success && result.categories) {
						const fetchedCategories = result.categories.map(category => ({
							_id: category._id,
							name: category.name,
							slug: category.slug,
							color: category.color,
							icon: category.icon,
						}))

						setCategories(fetchedCategories)
						if (fetchedCategories.length > 0 && !selectedCategory) {
							onCategoryChange(fetchedCategories[0].slug)
						}
					}
				} catch (error) {
					console.error('Error fetching categories:', error)
				} finally {
					setIsLoading(false)
				}
			}

			fetchCategories()
		}
	}, [initialCategories, onCategoryChange, selectedCategory])

	if (isLoading) {
		return (
			<div className='flex items-center gap-2 h-10 px-3 py-2 border rounded-md'>
				<div className='h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin' />
				<span className='text-sm text-muted-foreground'>
					Loading categories...
				</span>
			</div>
		)
	}

	return (
		<CategorySelect
			value={selectedCategory}
			onValueChange={onCategoryChange}
			categories={categories}
			className={className}
		/>
	)
}
