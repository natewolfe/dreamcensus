'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { CategoryCard } from './CategoryCard'

interface Category {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  color?: string
  order: number
}

interface CategoryProgress {
  formsCompleted: number
  totalForms: number
  promptAnswers: number
}

interface CategoryOverviewProps {
  categories: Category[]
  progress: Record<string, CategoryProgress>
}

export function CategoryOverview({
  categories,
  progress,
}: CategoryOverviewProps) {
  const router = useRouter()
  
  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/census/${categorySlug}`)
  }

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)
  
  const totalForms = categories.reduce((sum, c) => {
    const prog = progress[c.id]
    return sum + (prog?.totalForms ?? 0)
  }, 0)
  
  const completedForms = Object.values(progress).reduce(
    (sum, p) => sum + p.formsCompleted,
    0
  )
  
  const overallProgress = totalForms > 0
    ? Math.round((completedForms / totalForms) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-card-bg border border-border p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Overall Progress
            </h3>
            <p className="text-sm text-muted">
              {completedForms} of {totalForms} forms completed
            </p>
          </div>
          <div className="text-2xl font-bold text-accent">
            {overallProgress}%
          </div>
        </div>
        
        <div className="h-2 rounded-full bg-subtle/30 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-accent"
          />
        </div>
      </motion.div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCategories.map((category, index) => {
          const categoryProgress = progress[category.id] ?? {
            formsCompleted: 0,
            totalForms: 0,
            promptAnswers: 0,
          }

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CategoryCard
                category={category}
                progress={categoryProgress}
                onClick={() => handleCategoryClick(category.slug)}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

