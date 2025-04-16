'use client'

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import React from 'react';

import LucideDynamicIcon from '@/components/LucideDynamicIcon';
import { Loader2 } from 'lucide-react';


interface Category {
	_id: string
	name: string
	slug: string
	color?: string
	icon?: string
}

interface CategorySelectProps {
	value: string
	onValueChange: (value: string) => void
	categories: Category[]
	placeholder?: string
	disabled?: boolean
	className?: string
}

export default function CategorySelect({
	value,
	onValueChange,
	categories,
	placeholder = 'Select a category',
	disabled = false,
	className,
}: CategorySelectProps) {
	if (categories.length === 0) {
		return (
			<div className='flex items-center gap-2 h-10 px-3 py-2 border rounded-md'>
				<Loader2 className='h-4 w-4 animate-spin' />
				<span className='text-sm text-muted-foreground'>
					Loading categories...
				</span>
			</div>
		)
	}

	return (
		<Select value={value} onValueChange={onValueChange} disabled={disabled}>
			<SelectTrigger className={className}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{categories.map(category => (
					<SelectItem
						key={category._id}
						value={category.slug}
						className='flex items-center gap-2'
					>
						{category.color ? (
							<span
								className='inline-block w-3 h-3 rounded-full mr-2'
								style={{ backgroundColor: category.color }}
							/>
						) : null}
						<LucideDynamicIcon icon={category.icon} className="inline-block w-4 h-4 mr-2 align-text-bottom" />
						{category.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
