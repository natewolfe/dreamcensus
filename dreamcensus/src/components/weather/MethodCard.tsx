'use client'

import { Modal, Button } from '@/components/ui'

interface MethodCardProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  calculation: string
  dataSources: string[]
  privacySafeguards?: string[]
  limitations?: string[]
  version?: string
  lastUpdated?: Date
}

export function MethodCard({
  isOpen,
  onClose,
  title,
  description,
  calculation,
  dataSources,
  privacySafeguards,
  limitations,
  version = '1.0',
  lastUpdated,
}: MethodCardProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
    >
      <div className="space-y-6">
        {/* Description */}
        <p className="text-foreground leading-relaxed">
          {description}
        </p>

        {/* Calculation */}
        <div>
          <h4 className="text-sm font-medium text-muted mb-2 flex items-center gap-2">
            <span>📊</span> Calculation
          </h4>
          <p className="text-sm text-foreground">
            {calculation}
          </p>
        </div>

        {/* Data Sources */}
        <div>
          <h4 className="text-sm font-medium text-muted mb-2 flex items-center gap-2">
            <span>📥</span> Data Sources
          </h4>
          <ul className="space-y-1">
            {dataSources.map((source, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>{source}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Privacy Safeguards */}
        {privacySafeguards && privacySafeguards.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted mb-2 flex items-center gap-2">
              <span>🔒</span> Privacy
            </h4>
            <ul className="space-y-1">
              {privacySafeguards.map((safeguard, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{safeguard}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Limitations */}
        {limitations && limitations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted mb-2 flex items-center gap-2">
              <span>⚠️</span> Limitations
            </h4>
            <ul className="space-y-1">
              {limitations.map((limitation, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-muted">•</span>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Version */}
        <div className="pt-4 border-t border-border text-xs text-muted">
          v{version}
          {lastUpdated && (
            <> · Updated {lastUpdated.toLocaleDateString()}</>
          )}
        </div>

        {/* Close button */}
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </Modal>
  )
}

