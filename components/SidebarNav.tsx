'use client'

import { useSidebar } from '@/components/providers/sidebar-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
	Bookmark,
	BookMarked,
	Compass,
	Flame,
	History,
	Home,
	Library,
	Menu,
	Play,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface NavItemProps {
	href: string
	icon: React.ReactNode
	label: string
	isActive?: boolean
	collapsed?: boolean
}

function NavItem({ href, icon, label, isActive, collapsed }: NavItemProps) {
	if (collapsed) {
		return (
			<Link
				href={href}
				prefetch={false}
				className={cn(
					'flex flex-col items-center justify-center gap-1 p-2 rounded-md hover:bg-accent/50 transition-colors',
					isActive && 'bg-accent'
				)}
			>
				<div
					className={cn('text-muted-foreground', isActive && 'text-foreground')}
				>
					{icon}
				</div>
				<span className='text-[10px] text-center'>{label}</span>
			</Link>
		)
	}

	return (
		<Link
			href={href}
			prefetch={false}
			className={cn(
				'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/50 transition-colors',
				isActive && 'font-medium bg-accent'
			)}
		>
			<span
				className={cn('text-muted-foreground', isActive && 'text-foreground')}
			>
				{icon}
			</span>
			<span className='text-sm'>{label}</span>
		</Link>
	)
}

export function SidebarNav() {
	const pathname = usePathname()

	const [localSidebarState, setLocalSidebarState] = useState<
		'expanded' | 'collapsed' | 'hidden'
	>('collapsed')

	let sidebarState = localSidebarState
	let toggleSidebar = useCallback(
		() =>
			setLocalSidebarState(prev =>
				prev === 'expanded' ? 'collapsed' : 'expanded'
			),
		[]
	)

	let hideSidebar = useCallback(() => setLocalSidebarState('hidden'), [])

	try {
		const context = useSidebar()
		sidebarState = context.sidebarState
		toggleSidebar = context.toggleSidebar
		hideSidebar = context.hideSidebar
	} catch (error) {
		console.error('Error using SidebarProvider:', error)
	}

	useEffect(() => {
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			hideSidebar()
		}
	}, [pathname, hideSidebar])

	const isCollapsed = sidebarState === 'collapsed'
	const isExpanded = sidebarState === 'expanded'
	const isHidden = sidebarState === 'hidden'

	const sidebarWidth = isCollapsed ? 'w-20' : 'w-64'

	const mainNavItems = [
		{ href: '/', icon: <Home className='h-5 w-5' />, label: 'Home' },
		{
			href: '/explore',
			icon: <Compass className='h-5 w-5' />,
			label: 'Explore',
		},
		{
			href: '/subscriptions',
			icon: <Play className='h-5 w-5' />,
			label: 'Subscriptions',
		},
	]

	const libraryNavItems = [
		{
			href: '/my-courses',
			icon: <Library className='h-5 w-5' />,
			label: 'Your courses',
		},
		{
			href: '/history',
			icon: <History className='h-5 w-5' />,
			label: 'History',
		},

		{
			href: '/bookmarks',
			icon: <Bookmark className='h-5 w-5' />,
			label: 'Bookmarks',
		},
	]

	const topicNavItems = [
		{
			href: '/category/technology',
			icon: <Flame className='h-5 w-5 text-red-500' />,
			label: 'Technology',
		},
		{
			href: '/category/business',
			icon: <BookMarked className='h-5 w-5 text-blue-500' />,
			label: 'Business',
		},
		{
			href: '/category/design',
			icon: <Compass className='h-5 w-5 text-purple-500' />,
			label: 'Design',
		},
		{
			href: '/category/marketing',
			icon: <Play className='h-5 w-5 text-green-500' />,
			label: 'Marketing',
		},
	]

	if (typeof window !== 'undefined' && window.innerWidth < 640) {
		return (
			<nav className='fixed bottom-0 left-0 right-0 z-50 bg-background border-t flex justify-around items-center p-2'>
				{mainNavItems.map(item => (
					<NavItem
						key={item.href}
						href={item.href}
						icon={item.icon}
						label={item.label}
						isActive={pathname === item.href}
						collapsed={true}
					/>
				))}
				<Button
					variant='ghost'
					size='icon'
					className='p-2'
					onClick={toggleSidebar}
				>
					<div className='flex flex-col items-center gap-1'>
						<Menu className='h-5 w-5' />
						<span className='text-[10px]'>More</span>
					</div>
				</Button>
			</nav>
		)
	}

	return (
		<>
			{isExpanded && !isHidden && (
				<div
					className='fixed inset-0 bg-black/50 z-30 md:hidden'
					onClick={hideSidebar}
				/>
			)}

			<aside
				className={cn(
					'fixed top-16 bottom-0 left-0 z-40 overflow-y-auto py-4 border-r bg-background transition-all duration-300',
					sidebarWidth,
					isHidden && 'transform -translate-x-full',
					!isHidden && 'transform translate-x-0'
				)}
			>
				<div className='flex flex-col h-full'>
					{/* Main navigation */}
					<div className={cn('px-3 space-y-1 mb-4', isCollapsed && 'px-1')}>
						{mainNavItems.map(item => (
							<NavItem
								key={item.href}
								href={item.href}
								icon={item.icon}
								label={item.label}
								isActive={pathname === item.href}
								collapsed={isCollapsed}
							/>
						))}
					</div>

					<div
						className={cn(
							'border-t pt-4 px-3 space-y-1 mb-4',
							isCollapsed && 'px-1'
						)}
					>
						{libraryNavItems.map(item => (
							<NavItem
								key={item.href}
								href={item.href}
								icon={item.icon}
								label={item.label}
								isActive={pathname === item.href}
								collapsed={isCollapsed}
							/>
						))}
					</div>

					{/* Topics section */}
					{!isCollapsed && (
						<div className='border-t pt-4 px-3'>
							<h3 className='text-sm font-medium px-3 mb-2'>Popular Topics</h3>
							<div className='space-y-1'>
								{topicNavItems.map(item => (
									<NavItem
										key={item.href}
										href={item.href}
										icon={item.icon}
										label={item.label}
										isActive={pathname === item.href}
										collapsed={false}
									/>
								))}
							</div>
						</div>
					)}

					{isCollapsed && (
						<div className='border-t pt-4 px-1'>
							<div className='flex justify-center mb-2'>
								<div className='h-0.5 w-8 bg-muted-foreground/30 rounded-full' />
							</div>
							<div className='grid grid-cols-1 gap-1'>
								{topicNavItems.map(item => (
									<NavItem
										key={item.href}
										href={item.href}
										icon={item.icon}
										label={item.label}
										isActive={pathname === item.href}
										collapsed={true}
									/>
								))}
							</div>
						</div>
					)}
				</div>
			</aside>
		</>
	)
}
