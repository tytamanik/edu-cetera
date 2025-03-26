// components/EnrollButton.tsx
// Update this file to check if the user is the course creator

'use client'

import { createStripeCheckout } from '@/actions/createStripeCheckout'
import { isUserCourseCreator } from '@/app/actions/instructorActions'
import { useUser } from '@clerk/nextjs'
import { CheckCircle, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

function EnrollButton({
	courseId,
	isEnrolled,
}: {
	courseId: string
	isEnrolled: boolean
}) {
	const { user, isLoaded: isUserLoaded } = useUser()
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [isCreator, setIsCreator] = useState(false)
	const [isChecking, setIsChecking] = useState(true)

	useEffect(() => {
		if (isUserLoaded && user?.id) {
			setIsChecking(true)
			// Check if the user is the creator of this course
			startTransition(async () => {
				try {
					const result = await isUserCourseCreator(courseId, user.id)
					setIsCreator(result.isCreator)
				} catch (error) {
					console.error('Error checking if user is course creator:', error)
				} finally {
					setIsChecking(false)
				}
			})
		} else if (isUserLoaded) {
			setIsChecking(false)
		}
	}, [courseId, user?.id, isUserLoaded])

	const handleEnroll = async (courseId: string) => {
		startTransition(async () => {
			try {
				const userId = user?.id
				if (!userId) return

				const { url } = await createStripeCheckout(courseId, userId)
				if (url) {
					router.push(url)
				}
			} catch (error) {
				console.error('Error in handleEnroll:', error)
				throw new Error('Failed to create checkout session')
			}
		})
	}

	if (!isUserLoaded || isPending || isChecking) {
		return (
			<div className='w-full h-12 rounded-lg bg-gray-100 flex items-center justify-center'>
				<div className='w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin' />
			</div>
		)
	}

	if (isCreator) {
		return (
			<Link
				href={`/creator-dashboard/courses/${courseId}/edit`}
				prefetch={false}
				className='w-full rounded-lg px-6 py-3 font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 h-12 flex items-center justify-center gap-2 group'
			>
				<span>Edit Your Course</span>
				<Edit2 className='w-5 h-5 group-hover:scale-110 transition-transform' />
			</Link>
		)
	}

	if (isEnrolled) {
		return (
			<Link
				prefetch={false}
				href={`/dashboard/courses/${courseId}`}
				className='w-full rounded-lg px-6 py-3 font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-300 h-12 flex items-center justify-center gap-2 group'
			>
				<span>Access Course</span>
				<CheckCircle className='w-5 h-5 group-hover:scale-110 transition-transform' />
			</Link>
		)
	}

	return (
		<button
			className={`w-full rounded-lg px-6 py-3 font-medium transition-all duration-300 ease-in-out relative h-12
        ${
					isPending || !user?.id
						? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:scale-100'
						: 'bg-white text-black hover:scale-105 hover:shadow-lg hover:shadow-black/10'
				}
      `}
			disabled={!user?.id || isPending}
			onClick={() => handleEnroll(courseId)}
		>
			{!user?.id ? (
				<span className={`${isPending ? 'opacity-0' : 'opacity-100'}`}>
					Sign in to Enroll
				</span>
			) : (
				<span className={`${isPending ? 'opacity-0' : 'opacity-100'}`}>
					Enroll Now
				</span>
			)}
			{isPending && (
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin' />
				</div>
			)}
		</button>
	)
}

export default EnrollButton
