'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowDown, ArrowUp, Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import LessonEditor from './LessonEditor'

interface Module {
	_id?: string
	_key?: string
	title: string
	lessons: Lesson[]
	isNew?: boolean
}

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

interface ModuleEditorProps {
	module: Module
	onUpdate: (module: Module) => void
	onRemove: () => void
	onMoveUp: () => void
	onMoveDown: () => void
}

export default function ModuleEditor({
	module,
	onUpdate,
	onRemove,
	onMoveUp,
	onMoveDown,
}: ModuleEditorProps) {
	const [confirmDelete, setConfirmDelete] = useState(false)
	const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
	const [isLessonEditorOpen, setIsLessonEditorOpen] = useState(false)

	const updateTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
		onUpdate({
			...module,
			title: e.target.value,
		})
	}

	const addLesson = () => {
		const newLesson: Lesson = {
			_key: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			title: 'New Lesson',
			isNew: true,
		}

		onUpdate({
			...module,
			lessons: [...module.lessons, newLesson],
		})

		setSelectedLesson(newLesson)
		setIsLessonEditorOpen(true)
	}

	const editLesson = (lesson: Lesson) => {
		setSelectedLesson(lesson)
		setIsLessonEditorOpen(true)
	}

	const saveLesson = (updatedLesson: Lesson) => {
		onUpdate({
			...module,
			lessons: module.lessons.map(lesson =>
				lesson._key === updatedLesson._key ? updatedLesson : lesson
			),
		})

		setIsLessonEditorOpen(false)
	}

	const removeLesson = (lessonKey: string) => {
		onUpdate({
			...module,
			lessons: module.lessons.filter(lesson => lesson._key !== lessonKey),
		})
	}

	const moveLessonUp = (index: number) => {
		if (index <= 0) return

		const newLessons = [...module.lessons]
		const temp = newLessons[index]
		newLessons[index] = newLessons[index - 1]
		newLessons[index - 1] = temp

		onUpdate({
			...module,
			lessons: newLessons,
		})
	}

	const moveLessonDown = (index: number) => {
		if (index >= module.lessons.length - 1) return

		const newLessons = [...module.lessons]
		const temp = newLessons[index]
		newLessons[index] = newLessons[index + 1]
		newLessons[index + 1] = temp

		onUpdate({
			...module,
			lessons: newLessons,
		})
	}

	return (
		<div className='space-y-4'>
			<div className='grid grid-cols-[1fr,auto] gap-4'>
				<div className='space-y-2'>
					<Label htmlFor={`module-title-${module._key}`}>Module Title</Label>
					<Input
						id={`module-title-${module._key}`}
						value={module.title}
						onChange={updateTitle}
						placeholder='Enter module title'
					/>
				</div>

				<div className='flex items-end space-x-2'>
					<Button
						type='button'
						variant='outline'
						size='icon'
						onClick={onMoveUp}
						title='Move module up'
					>
						<ArrowUp className='h-4 w-4' />
					</Button>

					<Button
						type='button'
						variant='outline'
						size='icon'
						onClick={onMoveDown}
						title='Move module down'
					>
						<ArrowDown className='h-4 w-4' />
					</Button>

					<Button
						type='button'
						variant='outline'
						size='icon'
						onClick={() => setConfirmDelete(true)}
						className='text-red-500 hover:text-red-700'
						title='Delete module'
					>
						<Trash className='h-4 w-4' />
					</Button>
				</div>
			</div>

			<div className='mt-4'>
				<h3 className='text-sm font-medium mb-2'>Lessons</h3>

				{module.lessons.length === 0 ? (
					<div className='text-center py-8 border border-dashed rounded-md'>
						<p className='text-muted-foreground mb-2'>No lessons yet</p>
						<Button variant='outline' size='sm' onClick={addLesson}>
							<Plus className='h-4 w-4 mr-2' />
							Add Your First Lesson
						</Button>
					</div>
				) : (
					<div className='space-y-2'>
						{module.lessons.map((lesson, index) => (
							<div
								key={lesson._key}
								className='flex items-center justify-between p-3 border rounded-md'
							>
								<div className='flex-1 mr-2'>
									<h4 className='font-medium'>
										{lesson.title || 'Untitled Lesson'}
									</h4>
									{lesson.description && (
										<p className='text-sm text-muted-foreground line-clamp-1'>
											{lesson.description}
										</p>
									)}
								</div>

								<div className='flex space-x-2'>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={() => editLesson(lesson)}
									>
										Edit
									</Button>

									<Button
										type='button'
										variant='ghost'
										size='icon'
										onClick={() => moveLessonUp(index)}
									>
										<ArrowUp className='h-4 w-4' />
									</Button>

									<Button
										type='button'
										variant='ghost'
										size='icon'
										onClick={() => moveLessonDown(index)}
									>
										<ArrowDown className='h-4 w-4' />
									</Button>

									<Button
										type='button'
										variant='ghost'
										size='icon'
										onClick={() => removeLesson(lesson._key!)}
										className='text-red-500 hover:text-red-700'
									>
										<Trash className='h-4 w-4' />
									</Button>
								</div>
							</div>
						))}

						<Button
							variant='outline'
							className='w-full mt-2'
							onClick={addLesson}
						>
							<Plus className='h-4 w-4 mr-2' />
							Add Lesson
						</Button>
					</div>
				)}
			</div>

			{/* Delete Module Confirmation Dialog */}
			<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will delete the module &ldquo;{module.title}&rdquo; and all
							its lessons. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={onRemove}
							className='bg-red-500 hover:bg-red-600'
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Lesson Editor Dialog */}
			{selectedLesson && (
				<LessonEditor
					lesson={selectedLesson}
					isOpen={isLessonEditorOpen}
					onClose={() => setIsLessonEditorOpen(false)}
					onSave={saveLesson}
				/>
			)}
		</div>
	)
}
