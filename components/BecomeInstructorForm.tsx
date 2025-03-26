'use client'

import { becomeInstructorAction } from '@/app/actions/instructorActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GraduationCap, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface BecomeInstructorFormProps {
	userId: string
	userName: string
}

export default function BecomeInstructorForm({
	userId,
	userName,
}: BecomeInstructorFormProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)

		const name = formData.get('name') as string
		const bio = formData.get('bio') as string

		if (!name || !bio) {
			setError('Name and bio are required')
			return
		}

		setError(null)

		startTransition(async () => {
			try {
				const result = await becomeInstructorAction(formData, userId)

				if (result.success) {
					router.push('/creator-dashboard')
					router.refresh()
				} else {
					setError((result.error as string) || 'Failed to become an instructor')
				}
			} catch (error) {
				console.error('Error becoming instructor:', error)
				setError('An unexpected error occurred')
			}
		})
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			{error && (
				<div className='bg-red-50 text-red-600 p-3 rounded-md text-sm'>
					{error}
				</div>
			)}

			<div className='space-y-2'>
				<Label htmlFor='name'>Display Name</Label>
				<Input
					id='name'
					name='name'
					placeholder="How you'll appear to students"
					defaultValue={userName}
					required
				/>
				<p className='text-sm text-muted-foreground'>
					This is your public name shown to students
				</p>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='bio'>Bio</Label>
				<Textarea
					id='bio'
					name='bio'
					placeholder='Tell students about yourself, your expertise, and teaching style'
					className='min-h-[150px] resize-none'
					required
				/>
				<p className='text-sm text-muted-foreground'>
					Your expertise and experience helps students decide if your courses
					are right for them
				</p>
			</div>

			<Button type='submit' className='w-full' disabled={isPending}>
				{isPending ? (
					<>
						<Loader2 className='mr-2 h-4 w-4 animate-spin' />
						Processing...
					</>
				) : (
					<>
						<GraduationCap className='mr-2 h-4 w-4' />
						Become a Creator
					</>
				)}
			</Button>
		</form>
	)
}
