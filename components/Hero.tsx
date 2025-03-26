// File: components/Hero.tsx - Replace the entire content of this file
'use client'

import { Search } from 'lucide-react'
import Image from 'next/image'
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
		<div className='relative overflow-hidden'>
			{/* Background gradient with animated shapes */}
			<div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden'>
				{/* Animated circles */}
				<div className='absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow opacity-70'></div>
				<div
					className='absolute -bottom-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-slow opacity-80'
					style={{ animationDelay: '1s' }}
				></div>
				<div
					className='absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow opacity-60'
					style={{ animationDelay: '2s' }}
				></div>

				{/* Grid pattern overlay */}
				<div className='absolute inset-0 bg-grid-pattern opacity-[0.03]'></div>
			</div>

			<div className='container relative mx-auto px-4 py-24 md:py-32 flex flex-col lg:flex-row items-center z-10'>
				{/* Left column: Text content */}
				<div className='lg:w-1/2 space-y-8 text-center lg:text-left mb-12 lg:mb-0'>
					<div className='inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2'>
						Transform Your Learning Journey
					</div>
					<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent'>
						Unlock Knowledge Without Limits
					</h1>
					<p className='text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0'>
						Discover expert-led courses in technology, business, design, and
						more. Learn at your own pace and elevate your skills with Ed Cetera.
					</p>

					<form
						onSubmit={handleSearch}
						className='flex flex-col sm:flex-row gap-2 max-w-lg mx-auto lg:mx-0'
					>
						<div className='relative flex-grow'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground' />
							<Input
								type='text'
								placeholder='What do you want to learn today?'
								className='pl-10 h-12 rounded-xl md:rounded-r-none shadow-sm'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>
						<Button
							type='submit'
							className='h-12 rounded-xl md:rounded-l-none px-6 shadow-lg hover:shadow-primary/20 transition-all'
						>
							Explore Courses
						</Button>
					</form>

					<div className='flex flex-wrap gap-2 justify-center lg:justify-start'>
						<div className='text-sm text-muted-foreground mt-1'>
							Popular topics:
						</div>
						{['JavaScript', 'Python', 'React', 'Design', 'Business'].map(
							topic => (
								<Button
									key={topic}
									variant='outline'
									size='sm'
									className='rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors'
									onClick={() => router.push(`/search/${topic}`)}
								>
									{topic}
								</Button>
							)
						)}
					</div>
				</div>

				{/* Right column: Floating images */}
				<div className='lg:w-1/2 relative'>
					<div className='relative h-[400px] md:h-[500px] mx-auto'>
						{/* Main image */}
						<div className='absolute top-0 right-0 md:right-10 z-20 rounded-xl overflow-hidden border-4 border-white shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500'>
							<Image
								src='/hero/course1.jpg'
								alt='Course Preview'
								width={380}
								height={250}
								className='object-cover'
							/>
						</div>

						{/* Secondary image */}
						<div className='absolute top-36 right-32 md:right-52 z-10 rounded-xl overflow-hidden border-4 border-white shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-500'>
							<Image
								src='/hero/course2.jpg'
								alt='Course Preview'
								width={300}
								height={200}
								className='object-cover'
							/>
						</div>

						{/* Third image */}
						<div className='absolute top-64 right-0 md:right-20 z-30 rounded-xl overflow-hidden border-4 border-white shadow-xl transform rotate-6 hover:rotate-0 transition-transform duration-500'>
							<Image
								src='/hero/course3.jpg'
								alt='Course Preview'
								width={320}
								height={220}
								className='object-cover'
							/>
						</div>

						{/* Floating elements */}
						<div className='absolute top-20 left-10 md:left-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-40 transform hover:scale-105 transition-transform'>
							<div className='flex items-center gap-2'>
								<div className='w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold'>
									+
								</div>
								<div>
									<p className='text-sm font-medium'>Course Completed</p>
									<p className='text-xs text-muted-foreground'>React Mastery</p>
								</div>
							</div>
						</div>

						<div className='absolute bottom-20 left-0 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg z-40 transform hover:scale-105 transition-transform'>
							<div className='flex items-center gap-2'>
								<div className='flex -space-x-2'>
									<div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs'>
										JD
									</div>
									<div className='w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs'>
										KT
									</div>
									<div className='w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xs'>
										+3
									</div>
								</div>
								<p className='text-sm font-medium'>Join 2,500+ students</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Trust indicators */}
			<div className='container mx-auto px-4 pb-16'>
				<div className='bg-card/50 backdrop-blur-sm border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16'>
					<div className='flex items-center gap-2'>
						<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								className='text-primary'
							>
								<path d='M12 2H2v10h10V2z'></path>
								<path d='M12 12H2v10h10V12z'></path>
								<path d='M22 2h-10v20h10V2z'></path>
							</svg>
						</div>
						<div className='text-center md:text-left'>
							<p className='font-semibold'>500+</p>
							<p className='text-sm text-muted-foreground'>Courses</p>
						</div>
					</div>

					<div className='flex items-center gap-2'>
						<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								className='text-primary'
							>
								<rect width='18' height='18' x='3' y='3' rx='2'></rect>
								<path d='M12 8v8'></path>
								<path d='M8 12h8'></path>
							</svg>
						</div>
						<div className='text-center md:text-left'>
							<p className='font-semibold'>50+</p>
							<p className='text-sm text-muted-foreground'>
								Expert Instructors
							</p>
						</div>
					</div>

					<div className='flex items-center gap-2'>
						<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								className='text-primary'
							>
								<path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6'></path>
								<path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18'></path>
								<path d='M4 22h16'></path>
								<path d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22'></path>
								<path d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22'></path>
								<path d='M18 2H6v7a6 6 0 0 0 12 0V2Z'></path>
							</svg>
						</div>
						<div className='text-center md:text-left'>
							<p className='font-semibold'>100K+</p>
							<p className='text-sm text-muted-foreground'>
								Students Worldwide
							</p>
						</div>
					</div>

					<div className='flex items-center gap-2'>
						<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='24'
								height='24'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								className='text-primary'
							>
								<path d='M12 20L7.75 14.5'></path>
								<path d='M7.75 14.5C7.77319 14.5 7.79155 14.4878 7.799 14.4699C7.80644 14.452 7.7999 14.4334 7.7855 14.4221C7.7711 14.4108 7.75125 14.409 7.735 14.4186C7.71874 14.4281 7.71 14.4466 7.71 14.4699C7.71 14.4932 7.71874 14.5117 7.735 14.5212C7.75125 14.5308 7.7711 14.529 7.7855 14.5177C7.7999 14.5064 7.80644 14.4878 7.799 14.4699C7.79155 14.452 7.77319 14.4398 7.75 14.4398'></path>
								<path d='M12 20l4.25-5.5'></path>
								<path d='M16.25 14.5c-.0232 0-.0415.0122-.049.0301-.0074.0179-.0009.0365.0135.0478.0144.0113.0343.0131.0505.0035.0163-.0095.025-.028.025-.0513s-.0087-.0418-.025-.0513c-.0162-.0096-.0361-.0078-.0505.0035-.0144.0113-.0209.0299-.0135.0478.0075.0179.0258.0301.049.0301'></path>
								<path d='M7 9a5 5 0 0 1 10 0'></path>
								<path d='M21 10 A2 2 0 0 1 19 12 A2 2 0 0 1 17 10 A2 2 0 0 1 21 10'></path>
								<path d='M7 10 A2 2 0 0 1 5 12 A2 2 0 0 1 3 10 A2 2 0 0 1 7 10'></path>
							</svg>
						</div>
						<div className='text-center md:text-left'>
							<p className='font-semibold'>4.8/5</p>
							<p className='text-sm text-muted-foreground'>
								Student Satisfaction
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Add custom animations to CSS */}
			<style jsx global>{`
				@keyframes pulse-slow {
					0%,
					100% {
						opacity: 0.7;
						transform: scale(1);
					}
					50% {
						opacity: 0.4;
						transform: scale(1.05);
					}
				}
				.animate-pulse-slow {
					animation: pulse-slow 8s ease-in-out infinite;
				}
				.bg-grid-pattern {
					background-image:
						linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
						linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
					background-size: 50px 50px;
				}
			`}</style>
		</div>
	)
}
