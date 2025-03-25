// components/SearchInput.tsx
// Replace this file with the following code
'use client'

import { Mic, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from './ui/button'

interface SearchInputProps {
	onFocus?: () => void
	onBlur?: () => void
}

export function SearchInput({ onFocus, onBlur }: SearchInputProps) {
	const router = useRouter()
	const [searchQuery, setSearchQuery] = useState('')
	const [isFocused, setIsFocused] = useState(false)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (searchQuery.trim()) {
			router.push(`/search/${encodeURIComponent(searchQuery.trim())}`)
		}
	}

	const handleFocus = () => {
		setIsFocused(true)
		onFocus?.()
	}

	const handleBlur = () => {
		setIsFocused(false)
		onBlur?.()
	}

	const clearSearch = () => {
		setSearchQuery('')
	}

	return (
		<form onSubmit={handleSubmit} className='flex w-full max-w-[600px] mx-auto'>
			<div
				className={`flex items-center w-full relative rounded-l-full border ${isFocused ? 'border-blue-500' : 'border-input'} overflow-hidden`}
			>
				{isFocused && (
					<div className='pl-4'>
						<Search className='h-4 w-4 text-muted-foreground' />
					</div>
				)}
				<input
					type='text'
					placeholder='Search courses...'
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					onFocus={handleFocus}
					onBlur={handleBlur}
					className='w-full py-2 px-4 bg-background focus:outline-none text-sm'
				/>
				{searchQuery && (
					<button
						type='button'
						onClick={clearSearch}
						className='absolute right-2 text-muted-foreground hover:text-foreground'
					>
						<X className='h-4 w-4' />
					</button>
				)}
			</div>
			<Button
				type='submit'
				variant='secondary'
				className='rounded-r-full px-4 py-2 h-auto border border-l-0 border-input'
			>
				<Search className='h-4 w-4' />
			</Button>
			<Button
				type='button'
				variant='ghost'
				size='icon'
				className='ml-2 rounded-full'
			>
				<Mic className='h-4 w-4' />
			</Button>
		</form>
	)
}
