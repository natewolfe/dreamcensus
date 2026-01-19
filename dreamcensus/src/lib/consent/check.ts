import { db } from '../db'

export type ConsentScope = 'insights' | 'commons' | `study:${string}`

/** Check if user has granted a specific consent scope */
export async function hasConsent(
  userId: string,
  scope: ConsentScope
): Promise<boolean> {
  // Get most recent consent record for this scope
  const consent = await db.consent.findFirst({
    where: { userId, scope },
    orderBy: { timestamp: 'desc' },
  })
  return consent?.granted ?? false
}

/** Get all active consent scopes for a user */
export async function getUserConsents(
  userId: string
): Promise<Set<ConsentScope>> {
  const consents = await db.consent.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    distinct: ['scope'],
  })

  const active = new Set<ConsentScope>()
  for (const c of consents) {
    if (c.granted) active.add(c.scope as ConsentScope)
  }
  return active
}
