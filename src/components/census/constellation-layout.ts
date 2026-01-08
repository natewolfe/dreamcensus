// Census Constellation Layout - Organic Positioning Algorithm

import type { CensusSection, CensusProgress } from './types'
import { SECTION_KINDS } from './constants'

// ============================================================================
// Types
// ============================================================================

export interface Star {
  id: string
  kindSlug: string
  name: string
  icon: string
  x: number
  y: number
  size: number
  brightness: number
  type: 'kind' | 'section'
  isComplete: boolean
  isAvailable: boolean
  isLocked: boolean
  hasUnlockedSections: boolean
  sectionId?: string
  slug?: string
  progress?: number
}

export interface ConstellationLine {
  from: Star
  to: Star
  isComplete: boolean
}

export interface ConstellationData {
  stars: Star[]
  lines: ConstellationLine[]
}

interface Point {
  x: number
  y: number
}

interface LineSegment {
  p1: Point
  p2: Point
}

interface ConstellationKindNode {
  slug: string
  name: string
  description: string
  icon: string
  color: string
  progress: number
  isComplete: boolean
  hasUnlockedSections: boolean
  sections: ConstellationSectionNode[]
}

interface ConstellationSectionNode {
  id: string
  slug: string
  name: string
  icon: string
  kindSlug: string
  progress: number
  isComplete: boolean
  isLocked: boolean
  isAvailable: boolean
}

// ============================================================================
// Geometry Utilities
// ============================================================================

/** Check if two line segments intersect */
function segmentsIntersect(seg1: LineSegment, seg2: LineSegment): boolean {
  const { p1: a, p2: b } = seg1
  const { p1: c, p2: d } = seg2
  
  // Check if segments share an endpoint (that's OK, not a crossing)
  const epsilon = 0.1
  if (distance(a, c) < epsilon || distance(a, d) < epsilon ||
      distance(b, c) < epsilon || distance(b, d) < epsilon) {
    return false
  }
  
  const ccw = (A: Point, B: Point, C: Point) =>
    (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x)
  
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d)
}

/** Calculate distance between two points */
function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y)
}

/** Calculate minimum distance from a point to a line segment */
function pointToSegmentDistance(point: Point, seg: LineSegment): number {
  const { p1, p2 } = seg
  const l2 = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2
  
  if (l2 === 0) return distance(point, p1)
  
  let t = ((point.x - p1.x) * (p2.x - p1.x) + (point.y - p1.y) * (p2.y - p1.y)) / l2
  t = Math.max(0, Math.min(1, t))
  
  const projection = {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y),
  }
  
  return distance(point, projection)
}

/** Check if a new line would cross any existing lines */
function wouldCrossExistingLines(newLine: LineSegment, existingLines: LineSegment[]): boolean {
  return existingLines.some(existing => segmentsIntersect(newLine, existing))
}

/** Check if a point is too close to any existing lines */
function isTooCloseToLines(point: Point, lines: LineSegment[], minDistance: number): boolean {
  return lines.some(line => pointToSegmentDistance(point, line) < minDistance)
}

/** Check if a point is too close to any existing stars */
function isTooCloseToStars(point: Point, stars: Star[], minDistance: number): boolean {
  return stars.some(star => distance(point, star) < minDistance)
}

// ============================================================================
// Random Number Generator
// ============================================================================

function createRng(seed: number) {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

function generateSeed(kinds: typeof SECTION_KINDS): number {
  return kinds.reduce((acc, k) => acc + k.slug.charCodeAt(0) * k.slug.charCodeAt(1), 1337)
}

// ============================================================================
// Main Layout Function
// ============================================================================

export function generateConstellation(
  sections: CensusSection[],
  progress: Record<string, CensusProgress>,
  width: number,
  height: number
): ConstellationData {
  const kinds = buildKindNodes(sections, progress)
  const rng = createRng(generateSeed(SECTION_KINDS))
  
  const stars: Star[] = []
  const lines: ConstellationLine[] = []
  const lineSegments: LineSegment[] = [] // Track all line segments for collision detection
  
  // Margins proportional to canvas size
  const margin = { 
    x: Math.max(30, width * 0.04), 
    y: Math.max(25, height * 0.05) 
  }
  
  // Canvas bounds for constraining star positions
  const bounds = {
    minX: margin.x,
    maxX: width - margin.x,
    minY: margin.y,
    maxY: height - margin.y,
  }
  
  // Constants for spacing - enforce generous minimums
  const MIN_STAR_DISTANCE = 40
  const MIN_LINE_DISTANCE = 38
  
  // 1. Place Kind stars
  const kindStars = placeKindStarsGridBased(kinds, width, height, margin, rng)
  stars.push(...kindStars)
  
  // 2. Build MST for inter-kind connections
  const mstEdges = buildMinimumSpanningTree(kindStars)
  
  // Add MST edges to tracking
  for (const edge of mstEdges) {
    lineSegments.push({ p1: edge.from, p2: edge.to })
    lines.push({
      from: edge.from,
      to: edge.to,
      isComplete: edge.from.isComplete && edge.to.isComplete,
    })
  }
  
  // 3. Place section stars with collision avoidance
  kinds.forEach((kind, kindIndex) => {
    const kindStar = kindStars[kindIndex]
    if (!kindStar) return // Safety check
    
    const sectionStars = placeSectionStarsWithCollisionAvoidance(
      kind,
      kindStar,
      stars,
      lineSegments,
      bounds,
      MIN_STAR_DISTANCE,
      MIN_LINE_DISTANCE,
      rng
    )
    
    // Add section stars and their connecting lines
    let previousStar: Star = kindStar
    sectionStars.forEach((sectionStar) => {
      stars.push(sectionStar)
      
      // Check if this line would cross existing lines
      const newSegment: LineSegment = { p1: previousStar, p2: sectionStar }
      
      // Add the line
      lineSegments.push(newSegment)
      lines.push({
        from: previousStar,
        to: sectionStar,
        isComplete: sectionStar.isComplete,
      })
      
      previousStar = sectionStar
    })
  })
  
  return { stars, lines }
}

// ============================================================================
// Section Placement with Collision Avoidance
// ============================================================================

interface Bounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

function placeSectionStarsWithCollisionAvoidance(
  kind: ConstellationKindNode,
  kindStar: Star,
  existingStars: Star[],
  existingLines: LineSegment[],
  bounds: Bounds,
  minStarDistance: number,
  minLineDistance: number,
  rng: () => number
): Star[] {
  const sectionStars: Star[] = []
  const localLines: LineSegment[] = [...existingLines]
  
  // Find the best direction to extend sections (away from existing lines, within bounds)
  let currentAngle = findBestChainDirection(kindStar, existingLines, bounds, rng)
  
  // Place each section progressively, with angular drift for organic feel
  let previousPoint: Point = kindStar
  
  for (let i = 0; i < kind.sections.length; i++) {
    const section = kind.sections[i]
    if (!section) continue // Safety check
    
    // Add angular drift for organic meandering
    const driftAmount = 0.25 + rng() * 0.5 // 0.25 to 0.75 radians (~14-43 degrees)
    const driftDirection = rng() > 0.5 ? 1 : -1
    currentAngle += driftDirection * driftAmount
    
    // Highly varied distance: short (50-65), medium (70-95), or long (100-130)
    // Must be >= MIN_STAR_DISTANCE to avoid overlapping with parent star
    const distanceRoll = rng()
    let targetDistance: number
    if (distanceRoll < 0.3) {
      targetDistance = 50 + rng() * 15  // Short: 50-65
    } else if (distanceRoll < 0.7) {
      targetDistance = 70 + rng() * 25  // Medium: 70-95
    } else {
      targetDistance = 100 + rng() * 30 // Long: 100-130
    }
    
    // Try to find a valid position for this section
    const position = findValidSectionPosition(
      previousPoint,
      currentAngle,
      targetDistance,
      existingStars,
      sectionStars,
      localLines,
      bounds,
      minStarDistance,
      minLineDistance,
      rng
    )
    
    const sectionStar: Star = {
      id: section.id,
      kindSlug: kind.slug,
      name: section.name,
      icon: section.icon,
      x: position.x,
      y: position.y,
      size: 5 + (section.isComplete ? 2.5 : section.isAvailable ? 1.5 : 0) + rng() * 1.5,
      brightness: section.isComplete ? 0.9 : section.isAvailable ? 0.6 : 0.2,
      type: 'section',
      isComplete: section.isComplete,
      isAvailable: section.isAvailable,
      isLocked: section.isLocked,
      hasUnlockedSections: true,
      sectionId: section.id,
      slug: section.slug,
      progress: section.progress,
    }
    
    sectionStars.push(sectionStar)
    localLines.push({ p1: previousPoint, p2: position })
    
    // Update angle to match actual placement direction for next iteration
    currentAngle = Math.atan2(position.y - previousPoint.y, position.x - previousPoint.x)
    previousPoint = position
  }
  
  return sectionStars
}

/** Find the best direction to extend a chain of sections from a kind star */
function findBestChainDirection(
  kindStar: Star,
  existingLines: LineSegment[],
  bounds: Bounds,
  rng: () => number
): number {
  // Calculate how much room we have in each direction
  const roomLeft = kindStar.x - bounds.minX
  const roomRight = bounds.maxX - kindStar.x
  const roomUp = kindStar.y - bounds.minY
  const roomDown = bounds.maxY - kindStar.y
  
  // Sample angles and find the one with maximum clearance
  const samples = 48 // Every 7.5 degrees for finer resolution
  const candidates: Array<{ angle: number; score: number }> = []
  
  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2
    const dx = Math.cos(angle)
    const dy = Math.sin(angle)
    
    // Calculate how far we can go in this direction before hitting bounds
    let maxDist = 200
    if (dx > 0) maxDist = Math.min(maxDist, roomRight / dx)
    else if (dx < 0) maxDist = Math.min(maxDist, -roomLeft / dx)
    if (dy > 0) maxDist = Math.min(maxDist, roomDown / dy)
    else if (dy < 0) maxDist = Math.min(maxDist, -roomUp / dy)
    
    // Skip directions with very little room
    if (maxDist < 80) continue
    
    // Test at 60% of max distance to leave room for the chain
    const testDistance = maxDist * 0.6
    const testPoint: Point = {
      x: kindStar.x + dx * testDistance,
      y: kindStar.y + dy * testDistance,
    }
    
    const testSegment: LineSegment = { p1: kindStar, p2: testPoint }
    
    // Check for line crossings
    let wouldCross = false
    let minLineDist = Infinity
    
    for (const line of existingLines) {
      if (segmentsIntersect(testSegment, line)) {
        wouldCross = true
        break
      }
      const dist = pointToSegmentDistance(testPoint, line)
      minLineDist = Math.min(minLineDist, dist)
    }
    
    if (wouldCross) continue
    
    // Score: prefer directions with more room and distance from lines
    const score = maxDist * 2 + minLineDist
    candidates.push({ angle, score })
  }
  
  // Sort by score and pick the best
  candidates.sort((a, b) => b.score - a.score)
  
  const bestCandidate = candidates[0]
  if (bestCandidate) {
    // Add small random jitter
    return bestCandidate.angle + (rng() - 0.5) * 0.2
  }
  
  // Fallback: find direction with most room
  const fallbackAngle = Math.atan2(
    roomDown - roomUp,
    roomRight - roomLeft
  )
  return fallbackAngle + (rng() - 0.5) * 0.3
}

/** Check if a point is within bounds */
function isInBounds(point: Point, bounds: Bounds, padding: number = 10): boolean {
  return (
    point.x >= bounds.minX + padding &&
    point.x <= bounds.maxX - padding &&
    point.y >= bounds.minY + padding &&
    point.y <= bounds.maxY - padding
  )
}

/** Clamp a point to stay within bounds */
function clampToBounds(point: Point, bounds: Bounds, padding: number = 15): Point {
  return {
    x: Math.max(bounds.minX + padding, Math.min(bounds.maxX - padding, point.x)),
    y: Math.max(bounds.minY + padding, Math.min(bounds.maxY - padding, point.y)),
  }
}

/** Find a valid position for a section star that doesn't cause collisions */
function findValidSectionPosition(
  fromPoint: Point,
  baseAngle: number,
  targetDistance: number,
  existingStars: Star[],
  localStars: Star[],
  existingLines: LineSegment[],
  bounds: Bounds,
  minStarDistance: number,
  minLineDistance: number,
  rng: () => number
): Point {
  const allStars = [...existingStars, ...localStars]
  
  // FIRST: Try many different angles at full distance (prioritize direction over distance)
  const angleAttempts = [0, 0.15, -0.15, 0.3, -0.3, 0.5, -0.5, 0.7, -0.7, 0.9, -0.9, 1.1, -1.1, 1.4, -1.4]
  
  for (const angleOffset of angleAttempts) {
    const angle = baseAngle + angleOffset
    const dist = targetDistance + (rng() - 0.5) * 8
    
    const candidate: Point = {
      x: fromPoint.x + Math.cos(angle) * dist,
      y: fromPoint.y + Math.sin(angle) * dist,
    }
    
    // Check if in bounds first
    if (!isInBounds(candidate, bounds)) continue
    
    // Check constraints
    const newSegment: LineSegment = { p1: fromPoint, p2: candidate }
    
    const tooCloseToStar = isTooCloseToStars(candidate, allStars, minStarDistance)
    const tooCloseToLine = isTooCloseToLines(candidate, existingLines, minLineDistance)
    const wouldCross = wouldCrossExistingLines(newSegment, existingLines)
    
    if (!tooCloseToStar && !tooCloseToLine && !wouldCross) {
      return candidate
    }
  }
  
  // SECOND: If no angle works at full distance, try ALL angles (full circle scan)
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2
    const dist = targetDistance
    
    const candidate: Point = {
      x: fromPoint.x + Math.cos(angle) * dist,
      y: fromPoint.y + Math.sin(angle) * dist,
    }
    
    if (!isInBounds(candidate, bounds)) continue
    
    const newSegment: LineSegment = { p1: fromPoint, p2: candidate }
    const tooCloseToStar = isTooCloseToStars(candidate, allStars, minStarDistance)
    const tooCloseToLine = isTooCloseToLines(candidate, existingLines, minLineDistance)
    const wouldCross = wouldCrossExistingLines(newSegment, existingLines)
    
    if (!tooCloseToStar && !tooCloseToLine && !wouldCross) {
      return candidate
    }
  }
  
  // THIRD: Only now try shorter distances as last resort
  const shorterDistances = [targetDistance * 0.8, targetDistance * 0.6]
  for (const dist of shorterDistances) {
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      
      const candidate: Point = {
        x: fromPoint.x + Math.cos(angle) * dist,
        y: fromPoint.y + Math.sin(angle) * dist,
      }
      
      if (!isInBounds(candidate, bounds)) continue
      
      const newSegment: LineSegment = { p1: fromPoint, p2: candidate }
      const tooCloseToStar = isTooCloseToStars(candidate, allStars, minStarDistance)
      const wouldCross = wouldCrossExistingLines(newSegment, existingLines)
      
      if (!tooCloseToStar && !wouldCross) {
        return candidate
      }
    }
  }
  
  // Final fallback: find ANY in-bounds position
  const fallbackAngle = baseAngle + Math.PI // Try opposite direction
  const fallbackDist = 30
  const fallback: Point = {
    x: fromPoint.x + Math.cos(fallbackAngle) * fallbackDist,
    y: fromPoint.y + Math.sin(fallbackAngle) * fallbackDist,
  }
  return clampToBounds(fallback, bounds)
}

// ============================================================================
// Kind Star Placement
// ============================================================================

function placeKindStarsGridBased(
  kinds: ConstellationKindNode[],
  width: number,
  height: number,
  margin: { x: number; y: number },
  rng: () => number
): Star[] {
  const count = kinds.length
  
  // Calculate usable area
  const usableWidth = width - margin.x * 2
  const usableHeight = height - margin.y * 2
  
  // Determine grid layout based on aspect ratio
  const aspectRatio = width / height
  let cols: number
  let rows: number
  
  if (aspectRatio > 2) {
    // Very wide (desktop): maximize horizontal spread
    cols = Math.min(count, Math.ceil(count / 2) + 1)
    rows = Math.ceil(count / cols)
  } else if (aspectRatio > 1.2) {
    // Wide landscape: favor horizontal but allow some rows
    cols = Math.min(count, Math.ceil(Math.sqrt(count * 2)))
    rows = Math.ceil(count / cols)
  } else if (aspectRatio < 0.7) {
    // Very tall/narrow: stack vertically
    cols = Math.min(count, 2)
    rows = Math.ceil(count / cols)
  } else {
    // Square-ish to slightly portrait (mobile 600x700 = 0.86): balanced 3-column grid
    cols = Math.min(count, 3)
    rows = Math.ceil(count / cols)
  }
  
  const cellWidth = usableWidth / cols
  const cellHeight = usableHeight / rows
  
  // Base jitter proportional to cell size
  const baseJitterX = Math.min(cellWidth * 0.3, 100)
  const baseJitterY = Math.min(cellHeight * 0.5, 100)
  
  return kinds.map((kind, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    
    // Staggered offset: alternate rows/cols shift significantly
    // This creates more diagonal connections instead of straight horizontal/vertical
    const staggerX = (row % 2) * (cellWidth * 0.25)
    const staggerY = (col % 2) * (cellHeight * 0.2)
    
    // Add wave-like offset with varying frequency per position
    const waveOffsetX = Math.sin((row + col * 0.7) * 1.8) * (cellWidth * 0.2)
    const waveOffsetY = Math.cos((col + row * 0.5) * 1.5) * (cellHeight * 0.25)
    
    const basex = margin.x + cellWidth * (col + 0.5) + staggerX + waveOffsetX
    const basey = margin.y + cellHeight * (row + 0.5) + staggerY + waveOffsetY
    
    // Random jitter on top of the structured offsets
    const x = basex + (rng() - 0.5) * baseJitterX * 2
    const y = basey + (rng() - 0.5) * baseJitterY * 2
    
    const baseSize = 12
    const sizeBoost = kind.isComplete ? 5 : kind.progress > 0 ? 3 : 0
    const sizeJitter = rng() * 2
    
    let brightness: number
    if (!kind.hasUnlockedSections) {
      brightness = 0.25
    } else if (kind.isComplete) {
      brightness = 1
    } else if (kind.progress > 0) {
      brightness = 0.75
    } else {
      brightness = 0.5
    }
    
    return {
      id: kind.slug,
      kindSlug: kind.slug,
      name: kind.name,
      icon: kind.icon,
      x,
      y,
      size: baseSize + sizeBoost + sizeJitter,
      brightness,
      type: 'kind' as const,
      isComplete: kind.isComplete,
      isAvailable: !kind.isComplete && kind.progress >= 0,
      isLocked: false,
      hasUnlockedSections: kind.hasUnlockedSections,
      progress: kind.progress,
    }
  })
}

// ============================================================================
// Minimum Spanning Tree
// ============================================================================

function buildMinimumSpanningTree(stars: Star[]): Array<{ from: Star; to: Star }> {
  if (stars.length < 2) return []
  
  const firstStar = stars[0]
  if (!firstStar) return []
  
  const edges: Array<{ from: Star; to: Star }> = []
  const inTree = new Set<string>([firstStar.id])
  const notInTree = new Set(stars.slice(1).map(s => s.id))
  
  while (notInTree.size > 0) {
    let minDist = Infinity
    let bestEdge: { from: Star; to: Star } | null = null
    
    for (const star of stars) {
      if (!inTree.has(star.id)) continue
      
      for (const candidate of stars) {
        if (!notInTree.has(candidate.id)) continue
        
        const dist = distance(star, candidate)
        if (dist < minDist) {
          minDist = dist
          bestEdge = { from: star, to: candidate }
        }
      }
    }
    
    if (bestEdge) {
      edges.push(bestEdge)
      inTree.add(bestEdge.to.id)
      notInTree.delete(bestEdge.to.id)
    } else {
      break
    }
  }
  
  return edges
}

// ============================================================================
// Build Kind Nodes from Census Data
// ============================================================================

function buildKindNodes(
  sections: CensusSection[],
  progress: Record<string, CensusProgress>
): ConstellationKindNode[] {
  const sortedSections = [...sections].sort((a, b) => a.order - b.order)
  
  const nextIncompleteSection = sortedSections.find((s) => {
    const sectionProgress = progress[s.id]
    return !sectionProgress || !sectionProgress.completedAt
  })
  
  return SECTION_KINDS.map((kindDef) => {
    const kindSections = sortedSections.filter(
      (s) => s.slug && (kindDef.categorySlugs as readonly string[]).includes(s.slug)
    )
    
    const kindTotalQuestions = kindSections.reduce(
      (sum, s) => sum + s.questions.length,
      0
    )
    const kindAnsweredQuestions = kindSections.reduce(
      (sum, s) => sum + (progress[s.id]?.answeredQuestions ?? 0),
      0
    )
    const kindProgress =
      kindTotalQuestions > 0
        ? Math.round((kindAnsweredQuestions / kindTotalQuestions) * 100)
        : 0
    
    const isKindComplete = kindSections.every(
      (s) => progress[s.id]?.completedAt !== undefined
    )
    
    const sectionNodes: ConstellationSectionNode[] = kindSections.map((section) => {
      const sectionProgress = progress[section.id] ?? {
        sectionId: section.id,
        totalQuestions: section.questions.length,
        answeredQuestions: 0,
      }
      
      const sectionIndex = sortedSections.findIndex((s) => s.id === section.id)
      const isAvailable = section.id === nextIncompleteSection?.id
      const isLocked =
        sectionIndex > 0 &&
        section.id !== nextIncompleteSection?.id &&
        !sectionProgress.completedAt
      
      const sectionPercentage =
        sectionProgress.totalQuestions > 0
          ? Math.round(
              (sectionProgress.answeredQuestions / sectionProgress.totalQuestions) * 100
            )
          : 0
      
      return {
        id: section.id,
        slug: section.slug || section.id,
        name: section.name,
        icon: section.icon || kindDef.icon,
        kindSlug: kindDef.slug,
        progress: sectionPercentage,
        isComplete: sectionProgress.completedAt !== undefined,
        isLocked,
        isAvailable,
      }
    })
    
    const hasUnlockedSections = sectionNodes.some(s => !s.isLocked)
    
    return {
      slug: kindDef.slug,
      name: kindDef.name,
      description: kindDef.description,
      icon: kindDef.icon,
      color: kindDef.color,
      progress: kindProgress,
      isComplete: isKindComplete,
      hasUnlockedSections,
      sections: sectionNodes,
    }
  }).filter((kind) => kind.sections.length > 0)
}
