'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { BookOpen, Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import DarkModeToggle from './DarkModeToggle'
import HeaderAction from './HeaderAction'
import { useSidebar } from './providers/sidebar-provider'
import { SearchInput } from './SearchInput'
import { Button } from './ui/button'
import NotificationDropdown from './NotificationDropdown'

export default function Header() {
	const [sidebarVisible, setSidebarVisible] = useState(false)
	let toggleSidebar = () => setSidebarVisible(!sidebarVisible)

	try {
		const sidebarContext = useSidebar()
		toggleSidebar = sidebarContext.toggleSidebar
	} catch (error) {
		console.error('Error using SidebarProvider:', error)
	}

	return (
		<header className='fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border'>
			<div className='flex h-16 items-center px-4'>
				<div className='flex items-center gap-4'>
					<Button
						variant='ghost'
						size='icon'
						className='md:flex'
						onClick={toggleSidebar}
					>
						<Menu className='h-5 w-5' />
					</Button>

					<Link
						href='/'
						prefetch={false}
						className='flex items-center space-x-2 hover:opacity-90 transition-opacity'
					>
						<BookOpen className='h-6 w-6 text-primary' />
						<span className='text-xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent'>
							Ed Cetera
						</span>
					</Link>
				</div>

				<div className='flex-1 mx-4 md:mx-16'>
					<SearchInput />
				</div>

				<div className='flex items-center space-x-2 md:space-x-4'>
					<SignedIn>
						<HeaderAction />
						<div className='hidden md:flex'>
							<NotificationDropdown />
						</div>
						<UserButton afterSignOutUrl='/' />
					</SignedIn>

					<SignedOut>
						<SignInButton mode='modal'>
							<Button variant='outline' size='sm'>
								Sign In
							</Button>
						</SignInButton>
					</SignedOut>

					<DarkModeToggle />
				</div>
			</div>
		</header>
	)
}
