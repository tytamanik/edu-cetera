// File: components/dashboard/CourseContentEditor.tsx
'use client'

import { updateCourseCurriculumAction } from '@/app/actions/courseActions'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Plus, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import ModuleEditor from './ModuleEditor'

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

interface CourseContentEditorProps {
	courseId: string
	initialCurriculum: {
		_id: string
		title?: string
		modules: Module[]
	}
}

export default function CourseContentEditor({
	courseId,
	initialCurriculum,
}: CourseContentEditorProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	const generateKey = (prefix: string, existingKey?: string, id?: string) => {
		return (
			existingKey ||
			`${prefix}-${id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		)
	}

	const [modules, setModules] = useState<Module[]>(
		initialCurriculum.modules.map(module => ({
			...module,
			_key: generateKey('module', module._key, module._id),
			lessons: module.lessons.map(lesson => ({
				...lesson,
				_key: generateKey('lesson', lesson._key, lesson._id),
			})),
		}))
	)

	const [expandedModules, setExpandedModules] = useState<string[]>(
		modules.length > 0 ? [modules[0]._key || ''] : []
	)

	const addModule = () => {
		const newModule: Module = {
			_key: generateKey('module'),
			title: 'New Module',
			lessons: [],
			isNew: true,
		}

		setModules([...modules, newModule])

		setExpandedModules([...expandedModules, newModule._key!])
	}

	const updateModule = (updatedModule: Module) => {
		setModules(
			modules.map(module =>
				module._key === updatedModule._key ? updatedModule : module
			)
		)
	}

	const removeModule = (moduleKey: string) => {
		setModules(modules.filter(module => module._key !== moduleKey))

		setExpandedModules(expandedModules.filter(key => key !== moduleKey))
	}

	const moveModuleUp = (index: number) => {
		if (index <= 0) return

		const newModules = [...modules]
		const temp = newModules[index]
		newModules[index] = newModules[index - 1]
		newModules[index - 1] = temp

		setModules(newModules)
	}

	const moveModuleDown = (index: number) => {
		if (index >= modules.length - 1) return

		const newModules = [...modules]
		const temp = newModules[index]
		newModules[index] = newModules[index + 1]
		newModules[index + 1] = temp

		setModules(newModules)
	}

	const saveCurriculum = () => {
		startTransition(async () => {
			try {
				setError(null)

				const curriculumData = {
					courseId,
					modules: modules.map(module => ({
						_id: module._id,
						_key: module._key,
						title: module.title,
						isNew: module.isNew,
						lessons: module.lessons.map(lesson => ({
							_id: lesson._id,
							_key: lesson._key,
							title: lesson.title,
							slug: lesson.slug,
							description: lesson.description,
							videoUrl: lesson.videoUrl,
							loomUrl: lesson.loomUrl,
							content: lesson.content,
							isNew: lesson.isNew,
						})),
					})),
				}

				const result = await updateCourseCurriculumAction(curriculumData)

				if (result.success) {
					router.refresh()
				} else {
					setError(result.error || 'Failed to save curriculum')
				}
			} catch (error) {
				console.error('Error saving curriculum:', error)
				setError('An unexpected error occurred')
			}
		})
	}

	return (
		<div className='space-y-6'>
			{error && (
				<div className='bg-red-50 text-red-600 p-4 rounded-md mb-4'>
					{error}
				</div>
			)}

			<div className='flex justify-between items-center'>
				<h2 className='text-xl font-semibold'>Curriculum</h2>
				<Button onClick={saveCurriculum} disabled={isPending}>
					<Save className='mr-2 h-4 w-4' />
					{isPending ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>

			<div className='border rounded-md'>
				<Accordion
					type='multiple'
					value={expandedModules}
					onValueChange={setExpandedModules}
					className='w-full'
				>
					{modules.map((module, index) => (
						<AccordionItem key={module._key} value={module._key || ''}>
							<AccordionTrigger className='px-4 py-3 hover:no-underline'>
								<div className='flex-1 font-medium text-left'>
									{module.title || 'Untitled Module'}
								</div>
							</AccordionTrigger>
							<AccordionContent className='px-4 pt-2 pb-4'>
								<ModuleEditor
									module={module}
									onUpdate={updateModule}
									onRemove={() => removeModule(module._key!)}
									onMoveUp={() => moveModuleUp(index)}
									onMoveDown={() => moveModuleDown(index)}
								/>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>

			<Button variant='outline' onClick={addModule} className='w-full py-6'>
				<Plus className='mr-2 h-4 w-4' />
				Add Module
			</Button>
		</div>
	)
}
