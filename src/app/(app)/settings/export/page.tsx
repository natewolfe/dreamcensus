'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { useToast } from '@/hooks/use-toast'

export default function ExportDataPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // In production, this would call a Server Action to create export job
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      setExportComplete(true)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
      <PageHeader
        title="Export Your Data"
        subtitle="Download a complete copy of your data"
      />

      <div className="space-y-6">
        <Card padding="lg">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              What's included:
            </h3>
            
            <ul className="space-y-2">
              {[
                'All dream entries (encrypted and decrypted)',
                'Journal facts and tags',
                'Census responses',
                'Prompt responses',
                'Personal weather data',
                'Account settings',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-accent">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted">
                Your data will be exported as a JSON file. This may take a few minutes for large datasets.
              </p>
            </div>
          </div>
        </Card>

        {exportComplete ? (
          <Card padding="lg" variant="elevated">
            <div className="text-center space-y-4">
              <div className="text-4xl">✓</div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  Export Complete
                </h3>
                <p className="text-sm text-muted">
                  Your data has been downloaded
                </p>
              </div>
              <Button variant="secondary" onClick={() => setExportComplete(false)}>
                Export Again
              </Button>
            </div>
          </Card>
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleExport}
            loading={isExporting}
          >
            {isExporting ? 'Preparing Export...' : 'Export My Data'}
          </Button>
        )}
      </div>
    </div>
  )
}

