import Header from '@/components/Header'
import { SidebarNav } from '@/components/SidebarNav'
import { SidebarProvider } from '@/components/providers/sidebar-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { SanityLive } from '@/sanity/lib/live'
import { ClerkProvider } from '@clerk/nextjs'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Ed Cetera',
	description: 'Education Platform',
}

export default function UserLayout({
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
						<div className='flex flex-1 pt-16'>
							<SidebarNav />
							<main className='flex-1 md:ml-20 lg:ml-20 transition-all duration-300'>
								{children}
							</main>
						</div>
						<Footer />
					</div>
				</SidebarProvider>
			</ThemeProvider>

			<SanityLive />
		</ClerkProvider>
	)
}
