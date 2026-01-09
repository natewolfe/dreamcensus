import type { CensusQuestion } from '@/components/census/types'

export function hasValidAnswer(question: CensusQuestion, answer: unknown): boolean {
  if (answer === undefined || answer === null) return false
  
  switch (question.type) {
    case 'text':
    case 'shortText':
      return typeof answer === 'string' && answer.trim().length > 0
    
    case 'number': {
      if (typeof answer !== 'number' || isNaN(answer)) return false
      const min = question.config?.minValue
      const max = question.config?.maxValue
      if (min !== undefined && answer < min) return false
      if (max !== undefined && answer > max) return false
      return true
    }
    
    case 'multiChoice':
    case 'ranking':
      return Array.isArray(answer) && answer.length > 0
    
    case 'tagPool': {
      if (!Array.isArray(answer) || answer.length === 0) return false
      const minTags = question.config?.minTags
      if (minTags !== undefined && answer.length < minTags) return false
      return true
    }
    
    case 'matrix':
      return typeof answer === 'object' && Object.keys(answer as object).length > 0
    
    case 'choice':
    case 'binary':
    case 'imageChoice':
    case 'dropdown':
    case 'statement':
    case 'scale':
    case 'frequency':
    case 'date':
    case 'vas':
      return answer !== null && answer !== undefined
    
    default:
      return answer !== null && answer !== undefined
  }
}

