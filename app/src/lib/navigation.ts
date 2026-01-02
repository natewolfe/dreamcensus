/**
 * Centralized navigation configuration
 */

export const NAV_ITEMS = [
  { 
    id: 'home', 
    label: 'Home', 
    icon: '🏠', 
    href: '/', 
    description: 'Dashboard and rituals' 
  },
  { 
    id: 'census', 
    label: 'Census', 
    icon: '📋', 
    href: '/census/map', 
    description: 'Explore your mind' 
  },
  { 
    id: 'explore', 
    label: 'Explore', 
    icon: '🔭', 
    href: '/explore', 
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
  if (pathname === '/') return 'home'
  
  // Check for census routes
  if (pathname.startsWith('/census')) return 'census'
  
  // Check for explore/data routes
  if (pathname.startsWith('/explore') || pathname.startsWith('/data')) return 'explore'
  
  const item = NAV_ITEMS.find(n => pathname.startsWith(n.href) && n.href !== '/')
  return item?.id ?? null
}
