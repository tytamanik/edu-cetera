'use client'

import { createContext, useContext, useState } from 'react'

type SidebarState = 'expanded' | 'collapsed' | 'hidden'

type SidebarContextType = {
	sidebarState: SidebarState
	toggleSidebar: () => void
	expandSidebar: () => void
	collapseSidebar: () => void
	hideSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const [sidebarState, setSidebarState] = useState<SidebarState>('collapsed')

	const toggleSidebar = () => {
		setSidebarState(prev => {
			if (prev === 'expanded') return 'collapsed'
			if (prev === 'collapsed') return 'expanded'
			return 'expanded'
		})
	}

	const expandSidebar = () => setSidebarState('expanded')
	const collapseSidebar = () => setSidebarState('collapsed')
	const hideSidebar = () => setSidebarState('hidden')

	return (
		<SidebarContext.Provider
			value={{
				sidebarState,
				toggleSidebar,
				expandSidebar,
				collapseSidebar,
				hideSidebar,
			}}
		>
			{children}
		</SidebarContext.Provider>
	)
}

export function useSidebar() {
	const context = useContext(SidebarContext)
	if (context === undefined) {
		throw new Error('useSidebar must be used within a SidebarProvider')
	}
	return context
}
