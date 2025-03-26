'use client'

import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface CoursePreviewButtonProps {
	slug?: string
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
	size?: 'default' | 'sm' | 'lg' | 'icon'
	className?: string
}

export default function CoursePreviewButton({
	slug,
	variant = 'outline',
	size = 'sm',
	className,
}: CoursePreviewButtonProps) {
	const [hasSlug, setHasSlug] = useState<boolean>(false)

	useEffect(() => {
		setHasSlug(!!slug && slug.trim() !== '')
	}, [slug])

	return hasSlug ? (
		<Button asChild variant={variant} size={size} className={className}>
			<Link href={`/courses/${slug}`} target='_blank'>
				<Eye className='h-4 w-4 mr-2' />
				Preview Course
			</Link>
		</Button>
	) : (
		<Button variant={variant} size={size} className={className} disabled>
			<Eye className='h-4 w-4 mr-2' />
			Preview Course
		</Button>
	)
}
