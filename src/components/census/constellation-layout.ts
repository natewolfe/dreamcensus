// Census Constellation Layout - Organic Positioning Algorithm

import type { CensusSection, CensusProgress } from './types'
import { 
  SECTION_KINDS, 
  getCompletedSlugs, 
  getNextSection, 
  isSectionUnlocked 
} from './constants'

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
  hasNextSection: boolean
  sectionId?: string
  slug?: string
  progress?: number
}

export interface ConstellationLine {
  from: Star
  to: Star
  isComplete: boolean
  isUnlocked: boolean
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
  hasNextSection: boolean
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
  const MIN_LINE_DISTANCE = 48
  
  // 1. Place Kind stars
  const kindStars = placeKindStarsGridBased(kinds, width, height, margin, rng)
  stars.push(...kindStars)
  
  // 2. Connect kinds sequentially (matches SECTION_KINDS order in census list)
  const kindEdges = buildSequentialKindConnections(kindStars)
  
  // Add kind edges to tracking
  for (const edge of kindEdges) {
    lineSegments.push({ p1: edge.from, p2: edge.to })
    lines.push({
      from: edge.from,
      to: edge.to,
      isComplete: edge.from.isComplete && edge.to.isComplete,
      // For kind-to-kind lines, use hasUnlockedSections to determine if line is unlocked
      isUnlocked: edge.from.hasUnlockedSections && edge.to.hasUnlockedSections,
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
        isUnlocked: !sectionStar.isLocked,
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
      size: 7 + (section.isComplete ? 3 : section.isAvailable ? 2 : 0) + rng() * 1.5,
      brightness: section.isComplete ? 1 : section.isAvailable ? 0.7 : section.isLocked ? 0.35 : 0.5,
      type: 'section',
      isComplete: section.isComplete,
      isAvailable: section.isAvailable,
      isLocked: section.isLocked,
      hasUnlockedSections: true,
      hasNextSection: section.isAvailable,
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
// Kind Star Placement - Sequential path layout
// Places kinds along a meandering path that follows their sequential order
// ============================================================================

function placeKindStarsGridBased(
  kinds: ConstellationKindNode[],
  width: number,
  height: number,
  margin: { x: number; y: number },
  rng: () => number
): Star[] {
  const count = kinds.length
  if (count === 0) return []
  
  // Calculate usable area
  const usableWidth = width - margin.x * 2
  const usableHeight = height - margin.y * 2
  const aspectRatio = width / height
  
  // Generate base path positions based on aspect ratio
  // The path should meander in a constellation-like pattern while following sequential order
  const basePositions = generateSequentialPath(count, usableWidth, usableHeight, aspectRatio, rng)
  
  // Base jitter for organic feel
  const jitterX = Math.min(usableWidth * 0.04, 40)
  const jitterY = Math.min(usableHeight * 0.06, 40)
  
  return kinds.map((kind, i): Star => {
    const basePos = basePositions[i] ?? { x: 0, y: 0 }
    
    // Apply margin offset and jitter
    const x = margin.x + basePos.x + (rng() - 0.5) * jitterX
    const y = margin.y + basePos.y + (rng() - 0.5) * jitterY
    
    const baseSize = 12
    const sizeBoost = kind.isComplete ? 5 : kind.progress > 0 ? 3 : 0
    const sizeJitter = rng() * 2
    
    let brightness: number
    if (!kind.hasUnlockedSections) {
      brightness = 0.3
    } else if (kind.isComplete) {
      brightness = 1
    } else if (kind.progress > 0) {
      brightness = 0.6
    } else {
      brightness = 0.4
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
      type: 'kind',
      isComplete: kind.isComplete,
      isAvailable: !kind.isComplete && kind.progress >= 0,
      isLocked: false,
      hasUnlockedSections: kind.hasUnlockedSections,
      hasNextSection: kind.hasNextSection,
      progress: kind.progress,
    }
  })
}

/**
 * Generate a meandering path for kind stars that follows sequential order
 * Creates an organic constellation shape adapted to screen aspect ratio
 */
function generateSequentialPath(
  count: number,
  width: number,
  height: number,
  aspectRatio: number,
  rng: () => number
): Point[] {
  const positions: Point[] = []
  
  if (aspectRatio > 1.5) {
    // Desktop/wide: Serpentine path flowing horizontally with vertical waves
    // Pattern: start left, meander right with up/down movement
    const verticalAmplitude = height * 0.35
    const verticalCenter = height / 2
    
    for (let i = 0; i < count; i++) {
      // Progress along horizontal axis
      const progress = (i + 0.5) / count
      const x = progress * width
      
      // Vertical position: wave pattern with alternating direction
      // Creates a flowing S-curve or zigzag
      const wavePhase = i * 0.8 + rng() * 0.3
      const waveOffset = Math.sin(wavePhase) * verticalAmplitude
      
      // Add some drift to prevent too regular of a pattern
      const drift = (rng() - 0.5) * verticalAmplitude * 0.3
      const y = verticalCenter + waveOffset + drift
      
      positions.push({ x, y })
    }
  } else {
    // Mobile/portrait: Zigzag descending path
    // Pattern: alternate left-right while descending
    const horizontalAmplitude = width * 0.35
    const horizontalCenter = width / 2
    
    for (let i = 0; i < count; i++) {
      // Progress along vertical axis (top to bottom)
      const progress = (i + 0.5) / count
      const y = progress * height
      
      // Horizontal position: zigzag alternating left/right
      // Even indices go left of center, odd go right (or vice versa)
      const zigzagDirection = i % 2 === 0 ? -1 : 1
      const zigzagOffset = zigzagDirection * horizontalAmplitude * (0.5 + rng() * 0.5)
      
      // Add wave modulation for more organic feel
      const waveOffset = Math.sin(i * 1.2) * horizontalAmplitude * 0.2
      const x = horizontalCenter + zigzagOffset + waveOffset
      
      positions.push({ x, y })
    }
  }
  
  return positions
}

// ============================================================================
// Sequential Kind Connections - Connect kinds in SECTION_KINDS order
// ============================================================================

function buildSequentialKindConnections(kindStars: Star[]): Array<{ from: Star; to: Star }> {
  if (kindStars.length < 2) return []
  
  const edges: Array<{ from: Star; to: Star }> = []
  
  // Connect kinds sequentially in the order they appear (matches SECTION_KINDS order)
  // Self → Sleep → Dreams → Cognition → Feelings → Experience
  for (let i = 0; i < kindStars.length - 1; i++) {
    const fromStar = kindStars[i]
    const toStar = kindStars[i + 1]
    if (fromStar && toStar) {
      edges.push({ from: fromStar, to: toStar })
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
  
  // Get completed slugs and next section using shared helpers
  const completedSlugs = getCompletedSlugs(sortedSections, progress)
  const nextIncompleteSection = getNextSection(sortedSections, progress)
  
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
      
      const isAvailable = section.id === nextIncompleteSection?.id
      
      // Use prerequisites-based locking
      const isLocked = section.slug 
        ? !isSectionUnlocked(section.slug, completedSlugs) 
        : false
      
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
    const hasNextSection = sectionNodes.some(s => s.isAvailable)
    
    return {
      slug: kindDef.slug,
      name: kindDef.name,
      description: kindDef.description,
      icon: kindDef.icon,
      color: kindDef.color,
      progress: kindProgress,
      isComplete: isKindComplete,
      hasUnlockedSections,
      hasNextSection,
      sections: sectionNodes,
    }
  }).filter((kind) => kind.sections.length > 0)
}
