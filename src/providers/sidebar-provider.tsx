'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface SidebarContextValue {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)

  // Hydration-safe localStorage sync
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-open')
    if (stored !== null) setIsOpen(stored === 'true')
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebar-open', String(isOpen))
  }, [isOpen])

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen((prev) => !prev),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}

