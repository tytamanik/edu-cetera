// File: components/Hero.tsx
'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function Hero() {
	const [searchQuery, setSearchQuery] = useState('')
	const router = useRouter()

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		if (searchQuery.trim()) {
			router.push(`/search/${encodeURIComponent(searchQuery.trim())}`)
		}
	}

	return (
		<div className='relative min-h-[600px] w-full flex items-center'>
			{/* Background gradient */}
			<div className='absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5' />

			{/* Decorative elements */}
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl' />
				<div className='absolute top-1/2 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl' />
			</div>

			<div className='container mx-auto px-4 relative z-10'>
				<div className='max-w-3xl'>
					<h1 className='text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent'>
						Learn Without Limits
					</h1>
					<p className='text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed'>
						Discover expert-led courses in technology, business, design, and
						more. Unlock your potential with Ed Cetera.
					</p>

					<form onSubmit={handleSearch} className='flex max-w-2xl mb-8'>
						<div className='relative flex-grow'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground' />
							<Input
								type='text'
								placeholder='What do you want to learn today?'
								className='pl-10 h-12 rounded-r-none border-r-0'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>
						<Button type='submit' className='rounded-l-none h-12'>
							Search Courses
						</Button>
					</form>

					<div className='flex flex-wrap gap-3'>
						<span className='text-sm text-muted-foreground'>
							Popular searches:
						</span>
						<Button
							variant='link'
							className='text-sm p-0 h-auto'
							onClick={() => router.push('/search/javascript')}
						>
							JavaScript
						</Button>
						<Button
							variant='link'
							className='text-sm p-0 h-auto'
							onClick={() => router.push('/search/python')}
						>
							Python
						</Button>
						<Button
							variant='link'
							className='text-sm p-0 h-auto'
							onClick={() => router.push('/search/react')}
						>
							React
						</Button>
						<Button
							variant='link'
							className='text-sm p-0 h-auto'
							onClick={() => router.push('/search/design')}
						>
							UX Design
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
