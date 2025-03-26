'use client'

import { updateCourseAction } from '@/app/actions/courseActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@clerk/nextjs'
import { CheckCircle, Loader2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Course {
	_id: string
	title?: string
	description?: string
	price?: number
	slug?: { current?: string }
	published?: boolean
	category?: { slug?: { current?: string } }
}

interface CourseFormProps {
	courseId?: string
	initialData?: Course
}

export default function CourseForm({ courseId, initialData }: CourseFormProps) {
	const router = useRouter()
	const { user } = useUser()
	const [isPending, startTransition] = useTransition()
	const [errors, setErrors] = useState<Record<string, string>>({})

	const [formState, setFormState] = useState({
		title: initialData?.title || '',
		description: initialData?.description || '',
		price: initialData?.price || 0,
		category: initialData?.category?.slug?.current || 'technology',
		published: initialData?.published || false,
	})

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setFormState(prev => ({ ...prev, [name]: value }))
	}

	const handleSwitchChange = (checked: boolean) => {
		setFormState(prev => ({ ...prev, published: checked }))
	}

	const handleSelectChange = (value: string) => {
		setFormState(prev => ({ ...prev, category: value }))
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const newErrors: Record<string, string> = {}

		if (!formState.title) newErrors.title = 'Title is required'
		if (!formState.description)
			newErrors.description = 'Description is required'

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		setErrors({})

		const formData = new FormData()
		formData.append('courseId', courseId || '')
		formData.append('title', formState.title)
		formData.append('description', formState.description)
		formData.append('price', formState.price.toString())
		formData.append('category', formState.category)
		formData.append('published', formState.published.toString())

		if (user?.id) {
			formData.append('userId', user.id)
		}

		startTransition(async () => {
			try {
				const result = await updateCourseAction(formData)

				if (result.success) {
					router.refresh()
				} else {
					setErrors({
						form: (result.error as string) || 'Failed to update course',
					})
				}
			} catch (error) {
				console.error('Error updating course:', error)
				setErrors({ form: 'An unexpected error occurred' })
			}
		})
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-8'>
			{errors.form && (
				<div className='bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4'>
					{errors.form}
				</div>
			)}

			<div className='space-y-4'>
				<div className='space-y-2'>
					<Label htmlFor='title'>Course Title</Label>
					<Input
						id='title'
						name='title'
						value={formState.title}
						onChange={handleInputChange}
						placeholder='Introduction to Programming'
						className={errors.title ? 'border-red-500' : ''}
					/>
					{errors.title && (
						<p className='text-red-500 text-sm mt-1'>{errors.title}</p>
					)}
				</div>

				<div className='space-y-2'>
					<Label htmlFor='description'>Description</Label>
					<Textarea
						id='description'
						name='description'
						value={formState.description}
						onChange={handleInputChange}
						placeholder='Tell potential students what your course is about'
						className={`resize-none min-h-[150px] ${errors.description ? 'border-red-500' : ''}`}
					/>
					{errors.description && (
						<p className='text-red-500 text-sm mt-1'>{errors.description}</p>
					)}
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div className='space-y-2'>
						<Label htmlFor='category'>Category</Label>
						<Select
							name='category'
							value={formState.category}
							onValueChange={handleSelectChange}
						>
							<SelectTrigger>
								<SelectValue placeholder='Select a category' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='technology'>Technology</SelectItem>
								<SelectItem value='business'>Business</SelectItem>
								<SelectItem value='design'>Design</SelectItem>
								<SelectItem value='marketing'>Marketing</SelectItem>
								<SelectItem value='photography'>Photography</SelectItem>
								<SelectItem value='music'>Music</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='price'>Price (USD)</Label>
						<Input
							id='price'
							name='price'
							type='number'
							min='0'
							step='0.01'
							value={formState.price}
							onChange={handleInputChange}
							placeholder='29.99'
						/>
						<p className='text-xs text-muted-foreground'>
							Set to 0 for a free course
						</p>
					</div>
				</div>

				<div className='flex items-center space-x-2 mt-4'>
					<Switch
						id='published'
						checked={formState.published}
						onCheckedChange={handleSwitchChange}
					/>
					<Label htmlFor='published' className='cursor-pointer'>
						{formState.published ? (
							<span className='text-green-600 flex items-center'>
								<CheckCircle className='h-4 w-4 mr-2' />
								Published
							</span>
						) : (
							'Draft (not visible to students)'
						)}
					</Label>
				</div>
			</div>

			<div className='flex items-center justify-end space-x-4'>
				<Button type='button' variant='outline' onClick={() => router.back()}>
					Cancel
				</Button>
				<Button type='submit' disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							Saving...
						</>
					) : (
						<>
							<Save className='mr-2 h-4 w-4' />
							Save Changes
						</>
					)}
				</Button>
			</div>
		</form>
	)
}
