// components/HeaderAction.tsx
// Add this component to show the creator-related actions in header

'use client'

import { checkInstructorStatusAction } from '@/app/actions/instructorActions'
import { useUser } from '@clerk/nextjs'
import { GraduationCap, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BecomeInstructor from './BecomeInstructor'
import { Button } from './ui/button'

export default function HeaderAction() {
	const { user, isLoaded } = useUser()
	const router = useRouter()
	const [isInstructor, setIsInstructor] = useState(false)
	const [isChecking, setIsChecking] = useState(true)

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

	if (!isLoaded || isChecking) {
		return (
			<Button variant='ghost' size='sm' disabled>
				<Loader2 className='h-4 w-4 animate-spin' />
			</Button>
		)
	}

	if (!user) {
		return null
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

	return <BecomeInstructor />
}
