// components/BecomeInstructor.tsx
// Add this component to allow users to become instructors

'use client'

import {
	becomeInstructorAction,
	checkInstructorStatusAction,
} from '@/app/actions/instructorActions'
import { useUser } from '@clerk/nextjs'
import { GraduationCap, Loader2, PenTool } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Button } from './ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

export default function BecomeInstructor() {
	const { user, isLoaded } = useUser()
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [isInstructor, setIsInstructor] = useState(false)
	const [isChecking, setIsChecking] = useState(true)
	const [isPending, startTransition] = useTransition()

	useEffect(() => {
		if (isLoaded && user?.id) {
			setIsChecking(true)
			checkInstructorStatusAction(user.id).then(result => {
				setIsInstructor(result.isInstructor)
				setIsChecking(false)
			})
		} else if (isLoaded) {
			setIsChecking(false)
		}
	}, [isLoaded, user?.id])

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!user?.id) return

		const formData = new FormData(event.currentTarget)

		startTransition(async () => {
			const result = await becomeInstructorAction(formData, user.id)

			if (result.success) {
				setIsInstructor(true)
				setOpen(false)
				router.refresh()

				// Navigate to creator dashboard after successful conversion
				setTimeout(() => {
					router.push('/creator-dashboard')
				}, 500)
			} else {
				// Handle error
				console.error('Failed to become instructor:', result.error)
			}
		})
	}

	if (isChecking || !isLoaded) {
		return (
			<Button variant='ghost' size='sm' disabled>
				<Loader2 className='h-4 w-4 mr-2 animate-spin' />
				Loading
			</Button>
		)
	}

	if (isInstructor) {
		return (
			<Button
				variant='ghost'
				size='sm'
				onClick={() => router.push('/creator-dashboard')}
				className='flex items-center'
			>
				<GraduationCap className='h-4 w-4 mr-2' />
				Creator Dashboard
			</Button>
		)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='ghost' size='sm' className='flex items-center'>
					<PenTool className='h-4 w-4 mr-2' />
					Become a Creator
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>Become a Course Creator</DialogTitle>
					<DialogDescription>
						Set up your instructor profile to create and publish your own
						courses.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4 py-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>Display Name</Label>
						<Input
							id='name'
							name='name'
							placeholder="How you'll appear to students"
							defaultValue={`${user?.firstName || ''} ${user?.lastName || ''}`}
							required
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='bio'>Bio</Label>
						<Textarea
							id='bio'
							name='bio'
							placeholder='Tell students about yourself, your expertise, and teaching style'
							className='resize-none min-h-[120px]'
							required
						/>
					</div>
					{/* Photo upload would go here in a real implementation */}
					<DialogFooter>
						<Button type='submit' disabled={isPending}>
							{isPending ? (
								<>
									<Loader2 className='h-4 w-4 mr-2 animate-spin' />
									Processing...
								</>
							) : (
								<>Start Creating</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
