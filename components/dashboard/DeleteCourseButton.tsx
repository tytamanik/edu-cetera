// File: components/dashboard/DeleteCourseButton.tsx
'use client'

import { deleteCourseAction } from '@/app/actions/courseActions'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { Loader2, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface DeleteCourseButtonProps {
	courseId: string
	courseName?: string
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
	size?: 'default' | 'sm' | 'lg' | 'icon'
}

export default function DeleteCourseButton({
	courseId,
	courseName = 'this course',
	variant = 'outline',
	size = 'sm',
}: DeleteCourseButtonProps) {
	const router = useRouter()
	const { user } = useUser()
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const [isOpen, setIsOpen] = useState(false)

	const handleDelete = async () => {
		if (!user?.id) return

		startTransition(async () => {
			try {
				setError(null)

				const result = await deleteCourseAction(courseId, user.id)

				if (result.success) {
					setIsOpen(false)
					router.push('/creator-dashboard')
					router.refresh()
				} else {
					setError(result.error || 'Failed to delete course')
				}
			} catch (err) {
				console.error('Error deleting course:', err)
				setError('An unexpected error occurred')
			}
		})
	}

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogTrigger asChild>
				<Button variant={variant} size={size}>
					<Trash className='h-4 w-4 mr-2' />
					Delete
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete <strong>{courseName}</strong> and all
						its content including modules, lessons, and student enrollments.
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				{error && (
					<div className='bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4'>
						{error}
					</div>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={e => {
							e.preventDefault()
							handleDelete()
						}}
						disabled={isPending}
						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
					>
						{isPending ? (
							<>
								<Loader2 className='h-4 w-4 mr-2 animate-spin' />
								Deleting...
							</>
						) : (
							'Delete Course'
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
