// components/BookmarkButton.tsx
// Create this new file
'use client'

import {
	getIsBookmarkedAction,
	toggleBookmarkAction,
} from '@/app/actions/bookmarkActions'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useUser } from '@clerk/nextjs'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Button } from './ui/button'

interface BookmarkButtonProps {
	courseId: string
	variant?: 'default' | 'ghost' | 'outline'
	className?: string
}

export function BookmarkButton({
	courseId,
	variant = 'ghost',
	className,
}: BookmarkButtonProps) {
	const { user, isLoaded } = useUser()
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [isBookmarked, setIsBookmarked] = useState(false)
	const [isChecking, setIsChecking] = useState(true)

	useEffect(() => {
		if (isLoaded && user?.id) {
			setIsChecking(true)
			startTransition(async () => {
				try {
					const bookmarked = await getIsBookmarkedAction(courseId, user.id)
					setIsBookmarked(bookmarked)
				} catch (error) {
					console.error('Error checking bookmark status:', error)
				} finally {
					setIsChecking(false)
				}
			})
		} else {
			setIsChecking(false)
		}
	}, [courseId, user?.id, isLoaded])

	const handleToggleBookmark = () => {
		if (!user?.id) {
			// If not logged in, redirect to sign in
			return
		}

		startTransition(async () => {
			try {
				const result = await toggleBookmarkAction(courseId, user.id)
				if (result.success) {
					setIsBookmarked(result.bookmarked || false)
					router.refresh()
				}
			} catch (error) {
				console.error('Error toggling bookmark:', error)
			}
		})
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						onClick={handleToggleBookmark}
						disabled={isPending || isChecking || !isLoaded}
						variant={variant}
						size='icon'
						className={cn(className)}
					>
						{isPending || isChecking ? (
							<Loader2 className='h-5 w-5 animate-spin' />
						) : isBookmarked ? (
							<BookmarkCheck className='h-5 w-5 text-primary' />
						) : (
							<Bookmark className='h-5 w-5' />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					{isBookmarked ? 'Remove bookmark' : 'Save to bookmarks'}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
