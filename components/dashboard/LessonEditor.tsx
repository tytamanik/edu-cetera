'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Lesson {
	_id?: string
	_key?: string
	title: string
	slug?: { current: string }
	description?: string
	videoUrl?: string
	loomUrl?: string
	content?: unknown[]
	isNew?: boolean
}

interface LessonEditorProps {
	lesson: Lesson
	isOpen: boolean
	onClose: () => void
	onSave: (lesson: Lesson) => void
}

export default function LessonEditor({
	lesson,
	isOpen,
	onClose,
	onSave,
}: LessonEditorProps) {
	const [formState, setFormState] = useState<Lesson>({
		...lesson,
		slug: lesson.slug || { current: '' },
	})

	const generateSlug = (title: string) => {
		return title
			.toLowerCase()
			.replace(/[^\w\s]/gi, '')
			.replace(/\s+/g, '-')
	}

	useEffect(() => {
		if (!formState.slug?.current || formState.slug.current === '') {
			setFormState(prev => ({
				...prev,
				slug: { current: generateSlug(prev.title) },
			}))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formState.title])

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target

		if (name === 'slug') {
			setFormState(prev => ({
				...prev,
				slug: { current: value },
			}))
		} else {
			setFormState(prev => ({
				...prev,
				[name]: value,
			}))
		}
	}

	const handleSave = () => {
		onSave(formState)
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[700px]'>
				<DialogHeader>
					<DialogTitle>
						{lesson._id ? 'Edit Lesson' : 'Add New Lesson'}
					</DialogTitle>
				</DialogHeader>

				<Tabs defaultValue='basic'>
					<TabsList className='grid w-full grid-cols-2'>
						<TabsTrigger value='basic'>Basic Info</TabsTrigger>
						<TabsTrigger value='content'>Content & Video</TabsTrigger>
					</TabsList>

					<TabsContent value='basic' className='space-y-4 mt-4'>
						<div className='space-y-2'>
							<Label htmlFor='title'>Lesson Title</Label>
							<Input
								id='title'
								name='title'
								value={formState.title}
								onChange={handleInputChange}
								placeholder='Enter lesson title'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='slug'>Slug</Label>
							<Input
								id='slug'
								name='slug'
								value={formState.slug?.current || ''}
								onChange={handleInputChange}
								placeholder='lesson-url-slug'
							/>
							<p className='text-xs text-muted-foreground'>
								Used in the URL: /lessons/[slug]
							</p>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='description'>Description</Label>
							<Textarea
								id='description'
								name='description'
								value={formState.description || ''}
								onChange={handleInputChange}
								placeholder='Brief description of what students will learn'
								className='min-h-[100px]'
							/>
						</div>
					</TabsContent>

					<TabsContent value='content' className='space-y-4 mt-4'>
						<div className='space-y-2'>
							<Label htmlFor='videoUrl'>Video URL (YouTube, Vimeo, etc.)</Label>
							<Input
								id='videoUrl'
								name='videoUrl'
								value={formState.videoUrl || ''}
								onChange={handleInputChange}
								placeholder='https://youtube.com/watch?v=...'
							/>
							<p className='text-xs text-muted-foreground'>
								Supports YouTube, Vimeo, and other video platforms
							</p>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='loomUrl'>Loom URL</Label>
							<Input
								id='loomUrl'
								name='loomUrl'
								value={formState.loomUrl || ''}
								onChange={handleInputChange}
								placeholder='https://www.loom.com/share/...'
							/>
							<p className='text-xs text-muted-foreground'>
								Enter a Loom share URL to embed a Loom video
							</p>
						</div>

						<div className='border-t pt-4 mt-4'>
							<Label htmlFor='content'>Lesson Content</Label>
							<div className='mt-2 border rounded-md p-4 bg-muted/50'>
								<p className='text-center text-muted-foreground'>
									Rich text editor coming soon. For now, you can add content
									through the Sanity Studio.
								</p>
							</div>
							<p className='text-xs text-muted-foreground mt-2'>
								Add markdown, code snippets, and more to your lesson
							</p>
						</div>
					</TabsContent>
				</Tabs>

				<DialogFooter>
					<Button type='button' variant='outline' onClick={onClose}>
						Cancel
					</Button>
					<Button type='button' onClick={handleSave}>
						<Save className='h-4 w-4 mr-2' />
						Save Lesson
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
