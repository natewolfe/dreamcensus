// Dream School Types

export interface DreamSchoolTopic {
  id: string
  title: string
  subtitle: string
  icon: string
  color: string  // Tailwind gradient classes
  href: string
  /** Featured topics are displayed double-wide (2 columns) */
  featured?: boolean
}

export interface DreamSchoolArticle {
  id: string
  topicId: string
  title: string
  summary: string
  readTimeMinutes: number
  content: string // MDX or rich text
}

