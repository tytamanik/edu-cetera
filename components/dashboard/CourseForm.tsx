// File: components/dashboard/CourseForm.tsx
'use client'

import { updateCourseAction } from '@/app/actions/courseActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { urlFor } from '@/sanity/lib/image'
import { useUser } from '@clerk/nextjs'
import { CheckCircle, Loader2, PencilLine, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import ClientCategories from './ClientCategories'
import ImageUpload from './ImageUpload'

interface Category {
	_id: string
	name: string
	slug: string
	color?: string
}

interface Course {
	_id: string
	title?: string
	description?: string
	price?: number
	slug?: { current?: string }
	published?: boolean
	category?: { slug?: { current?: string } }
	image?: {
		asset?: {
			_ref: string
		}
	}
}

interface CourseFormProps {
	courseId?: string
	initialData?: Course
	categories: Category[]
}

export default function CourseForm({
	courseId,
	initialData,
	categories,
}: CourseFormProps) {
	const router = useRouter()
	const { user } = useUser()
	const [isPending, startTransition] = useTransition()
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [courseImage, setCourseImage] = useState<string | null>(
		initialData?.image ? urlFor(initialData.image).url() : null
	)

	const [formState, setFormState] = useState({
		title: initialData?.title || '',
		description: initialData?.description || '',
		price: initialData?.price || 0,
		category: initialData?.category?.slug?.current || categories[0]?.slug || '',
		published: initialData?.published || false,
	})

	useEffect(() => {
		if (categories.length > 0 && !formState.category) {
			setFormState(prev => ({ ...prev, category: categories[0]?.slug || '' }))
		}
	}, [categories, formState.category])

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setFormState(prev => ({ ...prev, [name]: value }))
	}

	const handleSwitchChange = (checked: boolean) => {
		setFormState(prev => ({ ...prev, published: checked }))
	}

	const handleCategoryChange = (value: string) => {
		setFormState(prev => ({ ...prev, category: value }))
	}

	const handleImageChange = (imageUrl: string | null) => {
		setCourseImage(imageUrl)
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const newErrors: Record<string, string> = {}

		if (!formState.title) newErrors.title = 'Title is required'
		if (!formState.description)
			newErrors.description = 'Description is required'
		if (!formState.category) newErrors.category = 'Category is required'

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

			<Tabs defaultValue='basic' className='w-full'>
				<TabsList className='grid w-full grid-cols-2'>
					<TabsTrigger value='basic'>Basic Info</TabsTrigger>
					<TabsTrigger value='content'>Content & Curriculum</TabsTrigger>
				</TabsList>

				<TabsContent value='basic' className='space-y-4'>
					<div className='grid md:grid-cols-[2fr,1fr] gap-6'>
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
									<p className='text-red-500 text-sm mt-1'>
										{errors.description}
									</p>
								)}
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='category'>Category</Label>
									<ClientCategories
										initialCategories={categories}
										selectedCategory={formState.category}
										onCategoryChange={handleCategoryChange}
										className={errors.category ? 'border-red-500' : ''}
									/>
									{errors.category && (
										<p className='text-red-500 text-sm mt-1'>
											{errors.category}
										</p>
									)}
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

						<div className='space-y-4'>
							<Label>Course Thumbnail</Label>
							{courseId ? (
								<ImageUpload
									courseId={courseId}
									initialImage={courseImage || undefined}
									onImageChange={handleImageChange}
								/>
							) : (
								<div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center'>
									<p className='text-sm text-muted-foreground'>
										Save the course first to upload an image
									</p>
								</div>
							)}
							<p className='text-xs text-muted-foreground'>
								An attractive thumbnail helps your course stand out
							</p>
						</div>
					</div>
				</TabsContent>

				<TabsContent value='content' className='space-y-4'>
					<div className='border rounded-md p-6 bg-muted/10'>
						<div className='text-center'>
							<h3 className='font-semibold mb-2'>Manage Course Content</h3>
							<p className='text-muted-foreground mb-4'>
								Add modules, lessons, and manage your course structure
							</p>

							{courseId ? (
								<Button asChild variant='default'>
									<Link href={`/creator-dashboard/courses/${courseId}/content`}>
										<PencilLine className='mr-2 h-4 w-4' />
										Edit Course Content & Curriculum
									</Link>
								</Button>
							) : (
								<Button disabled className='opacity-50 cursor-not-allowed'>
									Save course first to edit content
								</Button>
							)}
						</div>
					</div>
				</TabsContent>
			</Tabs>

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
