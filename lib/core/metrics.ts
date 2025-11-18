/**
 * Simple metrics collection utility
 * In production, this would integrate with services like Prometheus, Datadog, etc.
 */

interface MetricData {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: Date;
}

class MetricsCollector {
  private metrics: MetricData[] = [];
  private readonly maxStoredMetrics = 1000;

  recordCounter(name: string, value: number = 1, labels?: Record<string, string>) {
    this.addMetric({ name, value, labels, timestamp: new Date() });
  }

  recordGauge(name: string, value: number, labels?: Record<string, string>) {
    this.addMetric({ name, value, labels, timestamp: new Date() });
  }

  recordHistogram(name: string, value: number, labels?: Record<string, string>) {
    this.addMetric({ name, value, labels, timestamp: new Date() });
  }

  recordTiming(name: string, durationMs: number, labels?: Record<string, string>) {
    this.addMetric({
      name: `${name}.duration_ms`,
      value: durationMs,
      labels,
      timestamp: new Date(),
    });
  }

  private addMetric(metric: MetricData) {
    this.metrics.push(metric);

    // Keep only recent metrics in memory
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics = this.metrics.slice(-this.maxStoredMetrics);
    }

    // In development, log metrics
    if (process.env.NODE_ENV === "development") {
      console.debug("[METRIC]", JSON.stringify(metric));
    }
  }

  getMetrics(): MetricData[] {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }

  // Specialized metric methods
  trackApiCall(endpoint: string, method: string, statusCode: number, duration: number) {
    this.recordCounter("api.calls.total", 1, { endpoint, method, status: String(statusCode) });
    this.recordHistogram("api.duration_ms", duration, { endpoint, method });
  }

  trackDatabaseQuery(operation: string, table: string, duration: number) {
    this.recordCounter("database.queries.total", 1, { operation, table });
    this.recordHistogram("database.duration_ms", duration, { operation, table });
  }

  trackCacheHit(key: string, hit: boolean) {
    this.recordCounter("cache.requests", 1, { key, result: hit ? "hit" : "miss" });
  }

  trackBusinessMetric(metric: string, value: number, labels?: Record<string, string>) {
    this.recordGauge(`business.${metric}`, value, labels);
  }
}

export const metrics = new MetricsCollector();

// Helper function to measure execution time
export async function measureTime<T>(
  name: string,
  fn: () => Promise<T>,
  labels?: Record<string, string>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    metrics.recordTiming(name, duration, labels);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    metrics.recordTiming(name, duration, { ...labels, error: "true" });
    throw error;
  }
}
