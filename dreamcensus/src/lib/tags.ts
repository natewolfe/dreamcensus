import { db } from './db'
import { slugify } from './utils'

export interface TagWithName {
  id: string
  name: string
  slug: string
}

/** Fetch tag names for a dream entry */
export async function getDreamTagNames(dreamEntryId: string): Promise<string[]> {
  const dreamTags = await db.dreamTag.findMany({
    where: { dreamEntryId },
    include: { tag: { select: { name: true } } },
  })
  return dreamTags.map((dt) => dt.tag.name)
}

/** Fetch tags for multiple dreams (batched) */
export async function getDreamTagsMap(
  dreamEntryIds: string[]
): Promise<Map<string, string[]>> {
  const dreamTags = await db.dreamTag.findMany({
    where: { dreamEntryId: { in: dreamEntryIds } },
    include: { tag: { select: { name: true } } },
  })

  const map = new Map<string, string[]>()
  for (const dt of dreamTags) {
    const existing = map.get(dt.dreamEntryId) ?? []
    existing.push(dt.tag.name)
    map.set(dt.dreamEntryId, existing)
  }
  return map
}

/** Create or update tags for a dream (handles upsert) */
export async function setDreamTags(
  dreamEntryId: string,
  tagNames: string[]
): Promise<void> {
  // Delete existing
  await db.dreamTag.deleteMany({ where: { dreamEntryId } })

  // Create new
  for (const name of tagNames) {
    const tag = await db.tag.upsert({
      where: { slug: slugify(name) },
      create: { name, slug: slugify(name), category: 'custom', usageCount: 1 },
      update: { usageCount: { increment: 1 } },
    })
    await db.dreamTag.create({
      data: { dreamEntryId, tagId: tag.id, source: 'user' },
    })
  }
}
