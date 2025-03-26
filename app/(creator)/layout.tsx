import Header from '@/components/Header'
import { SidebarProvider } from '@/components/providers/sidebar-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { SanityLive } from '@/sanity/lib/live'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Creator Dashboard - Ed Cetera',
	description: 'Manage your courses and content',
}

export default function CreatorLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<ClerkProvider>
			<ThemeProvider
				attribute='class'
				defaultTheme='system'
				enableSystem
				disableTransitionOnChange
			>
				<SidebarProvider>
					<div className='min-h-screen flex flex-col'>
						<Header />
						<main className='flex-1'>{children}</main>
					</div>
				</SidebarProvider>
				<SanityLive />
			</ThemeProvider>
		</ClerkProvider>
	)
}
