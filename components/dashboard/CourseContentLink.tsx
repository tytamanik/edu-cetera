// File: components/dashboard/CourseContentLink.tsx
'use client'

import { Button } from '@/components/ui/button'
import { PencilLine } from 'lucide-react'
import Link from 'next/link'

interface CourseContentLinkProps {
	courseId: string
	variant?: 'default' | 'outline' | 'secondary' | 'ghost'
	size?: 'default' | 'sm' | 'lg'
}

export default function CourseContentLink({
	courseId,
	variant = 'default',
	size = 'default',
}: CourseContentLinkProps) {
	return (
		<Button asChild variant={variant} size={size}>
			<Link href={`/creator-dashboard/courses/${courseId}/content`}>
				<PencilLine className='mr-2 h-4 w-4' />
				Edit Course Content
			</Link>
		</Button>
	)
}
