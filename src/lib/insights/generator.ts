import type { InsightData, GeneratedInsight } from './types'
import { INSIGHT_TEMPLATES } from './templates'

/**
 * Generate insights from available data
 * 
 * Evaluates all templates against provided data, calculates priorities,
 * and returns top N insights sorted by signal strength
 * 
 * @param data - Available data for insight generation
 * @param maxInsights - Maximum number of insights to return (default: 5)
 * @returns Array of generated insights sorted by priority
 */
export function generateInsights(
  data: InsightData,
  maxInsights: number = 5
): GeneratedInsight[] {
  const candidates: GeneratedInsight[] = []

  // Evaluate each template
  for (const template of INSIGHT_TEMPLATES) {
    try {
      // Check if template's condition is met
      if (template.condition(data)) {
        // Calculate priority for this template
        const priority = template.priority(data)
        
        // Generate the insight
        candidates.push({
          id: template.id,
          label: template.label,
          message: template.message(data),
          priority,
        })
      }
    } catch (error) {
      // Skip templates that fail evaluation
      // This provides graceful degradation with partial data
      continue
    }
  }

  // Sort by priority (highest first) and take top N
  return candidates
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxInsights)
}
