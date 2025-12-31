/**
 * Performance monitoring utilities
 */

export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: Date
  metadata?: Record<string, any>
}

/**
 * Measure execution time of an async function
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const start = performance.now()
  
  try {
    const result = await fn()
    const duration = performance.now() - start
    
    logMetric({
      name,
      duration,
      timestamp: new Date(),
      metadata,
    })
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    
    logMetric({
      name: `${name} (error)`,
      duration,
      timestamp: new Date(),
      metadata: {
        ...metadata,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })
    
    throw error
  }
}

/**
 * Measure execution time of a synchronous function
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  const start = performance.now()
  
  try {
    const result = fn()
    const duration = performance.now() - start
    
    logMetric({
      name,
      duration,
      timestamp: new Date(),
      metadata,
    })
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    
    logMetric({
      name: `${name} (error)`,
      duration,
      timestamp: new Date(),
      metadata: {
        ...metadata,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })
    
    throw error
  }
}

/**
 * Log a performance metric
 */
function logMetric(metric: PerformanceMetric): void {
  // Log slow operations in development
  if (process.env.NODE_ENV === 'development' && metric.duration > 1000) {
    console.warn(`[Performance] Slow operation: ${metric.name} took ${metric.duration.toFixed(2)}ms`)
  }

  // TODO: Send to monitoring service
  // - Vercel Analytics
  // - DataDog
  // - New Relic
  // - Custom metrics backend
}

/**
 * Database query performance wrapper
 */
export async function monitorQuery<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  return measureAsync(`db:${queryName}`, query)
}

/**
 * Server action performance wrapper
 */
export async function monitorAction<T>(
  actionName: string,
  action: () => Promise<T>
): Promise<T> {
  return measureAsync(`action:${actionName}`, action)
}

/**
 * Cache hit/miss tracking
 */
export function trackCacheHit(key: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Cache] HIT: ${key}`)
  }
  // TODO: Send to monitoring service
}

export function trackCacheMiss(key: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Cache] MISS: ${key}`)
  }
  // TODO: Send to monitoring service
}

