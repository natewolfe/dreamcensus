/**
 * Centralized navigation configuration
 */

export const NAV_ITEMS = [
  { 
    id: 'stream', 
    label: 'Stream', 
    icon: '🌊', 
    href: '/', 
    description: 'Endless questions' 
  },
  { 
    id: 'census', 
    label: 'Census', 
    icon: '📋', 
    href: '/census', 
    description: 'Explore your mind' 
  },
  { 
    id: 'data', 
    label: 'Data', 
    icon: '📊', 
    href: '/data', 
    description: 'Collective insights' 
  },
  { 
    id: 'journal', 
    label: 'Journal', 
    icon: '📔', 
    href: '/journal', 
    description: 'Capture dreams' 
  },
] as const

export type NavItemId = typeof NAV_ITEMS[number]['id']

/**
 * Determine active navigation item from pathname
 */
export function getActiveNavFromPath(pathname: string): NavItemId | null {
  if (pathname === '/') return 'stream'
  
  const item = NAV_ITEMS.find(n => pathname.startsWith(n.href) && n.href !== '/')
  return item?.id ?? null
}

