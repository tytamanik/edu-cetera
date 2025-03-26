// File: components/FollowInstructorButton.tsx
'use client'

import { toggleFollowInstructorAction } from '@/app/actions/instructorActions'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface FollowInstructorButtonProps {
	instructorId: string
	userId: string
	isFollowing: boolean
	variant?: 'default' | 'outline' | 'secondary' | 'ghost'
	size?: 'default' | 'sm' | 'lg'
}

export function FollowInstructorButton({
	instructorId,
	userId,
	isFollowing,
	variant = 'default',
	size = 'default',
}: FollowInstructorButtonProps) {
	const router = useRouter()
	const { isLoaded } = useUser()
	const [isPending, startTransition] = useTransition()
	const [following, setFollowing] = useState(isFollowing)

	const handleToggleFollow = () => {
		if (!userId || !isLoaded) return

		setFollowing(prev => !prev)

		startTransition(async () => {
			try {
				const result = await toggleFollowInstructorAction(instructorId, userId)

				if (!result.success) {
					// Revert UI state if the action failed
					setFollowing(prev => !prev)
				}

				router.refresh()
			} catch (error) {
				console.error('Error toggling instructor follow:', error)
				// Revert UI state if there was an error
				setFollowing(prev => !prev)
			}
		})
	}

	return (
		<Button
			onClick={handleToggleFollow}
			disabled={isPending || !isLoaded}
			variant={following ? 'outline' : variant}
			size={size}
			className='w-full'
		>
			{isPending ? (
				<>
					<Loader2 className='h-4 w-4 mr-2 animate-spin' />
					Updating...
				</>
			) : following ? (
				<>
					<BellOff className='h-4 w-4 mr-2' />
					Unfollow
				</>
			) : (
				<>
					<Bell className='h-4 w-4 mr-2' />
					Follow
				</>
			)}
		</Button>
	)
}
