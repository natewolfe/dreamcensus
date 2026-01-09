'use client'

import { type ReactNode } from 'react'
import { PageHeader } from '@/components/layout'
import { Card, Button, Spinner } from '@/components/ui'

export interface FlowPageWrapperProps {
  title?: string
  subtitle?: string
  onExit: () => void
  exitText?: string
  hideExit?: boolean
  children: ReactNode
  isSaving?: boolean
}

/**
 * Page-level wrapper for Morning/Night flows
 * Mirrors CategorySectionRunner pattern with PageHeader + Card wrapper
 */
export function FlowPageWrapper({
  title,
  subtitle,
  onExit,
  exitText = 'Exit',
  hideExit = false,
  children,
  isSaving = false,
}: FlowPageWrapperProps) {
  if (isSaving) {
    return (
      <div id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
        {title && <PageHeader title={title} subtitle={subtitle} />}
        <div className="space-y-6">
          <Card padding="lg">
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner size="lg" />
              <p className="text-muted mt-4">Saving...</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
      {title ? (
        <PageHeader
          title={title}
          subtitle={subtitle}
          actions={
            !hideExit ? (
              <Button variant="secondary" onClick={onExit}>
                {exitText}
              </Button>
            ) : undefined
          }
        />
      ) : !hideExit ? (
        <div className="mb-6 flex justify-end">
          <Button variant="secondary" onClick={onExit}>
            {exitText}
          </Button>
        </div>
      ) : (
        <div className="mb-6" />
      )}
      <div className="space-y-6">
        <Card padding="lg">
          {children}
        </Card>
      </div>
    </div>
  )
}

