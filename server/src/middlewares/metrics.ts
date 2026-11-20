import type { Request, Response, NextFunction } from 'express';

interface MetricBucket {
  [key: string]: number;
}

class MetricsRegistry {
  private requestCounter: MetricBucket = {};
  private requestDurationSum: MetricBucket = {};
  private requestDurationCount: MetricBucket = {};

  public recordRequest(method: string, route: string, status: number, durationMs: number): void {
    const key = `method="${method}",route="${route}",status="${status}"`;
    this.requestCounter[key] = (this.requestCounter[key] || 0) + 1;
    this.requestDurationSum[key] = (this.requestDurationSum[key] || 0) + durationMs / 1000;
    this.requestDurationCount[key] = (this.requestDurationCount[key] || 0) + 1;
  }

  public getPrometheusText(): string {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    const uptime = process.uptime();

    let output = '';

    // Process memory & CPU
    output += '# HELP process_resident_memory_bytes Resident memory size in bytes.\n';
    output += '# TYPE process_resident_memory_bytes gauge\n';
    output += `process_resident_memory_bytes ${mem.rss}\n\n`;

    output += '# HELP process_heap_used_bytes Process heap memory used.\n';
    output += '# TYPE process_heap_used_bytes gauge\n';
    output += `process_heap_used_bytes ${mem.heapUsed}\n\n`;

    output += '# HELP process_uptime_seconds Total uptime of Node process in seconds.\n';
    output += '# TYPE process_uptime_seconds counter\n';
    output += `process_uptime_seconds ${uptime.toFixed(2)}\n\n`;

    output += '# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.\n';
    output += '# TYPE process_cpu_user_seconds_total counter\n';
    output += `process_cpu_user_seconds_total ${(cpu.user / 1e6).toFixed(4)}\n\n`;

    output += '# HELP process_cpu_system_seconds_total Total system CPU time spent in seconds.\n';
    output += '# TYPE process_cpu_system_seconds_total counter\n';
    output += `process_cpu_system_seconds_total ${(cpu.system / 1e6).toFixed(4)}\n\n`;

    // HTTP metrics
    output += '# HELP http_requests_total Total number of HTTP requests made.\n';
    output += '# TYPE http_requests_total counter\n';
    for (const [labels, count] of Object.entries(this.requestCounter)) {
      output += `http_requests_total{${labels}} ${count}\n`;
    }
    output += '\n';

    output += '# HELP http_request_duration_seconds Total time spent in HTTP requests.\n';
    output += '# TYPE http_request_duration_seconds summary\n';
    for (const [labels, sum] of Object.entries(this.requestDurationSum)) {
      const count = this.requestDurationCount[labels] || 1;
      output += `http_request_duration_seconds_sum{${labels}} ${sum.toFixed(6)}\n`;
      output += `http_request_duration_seconds_count{${labels}} ${count}\n`;
    }
    output += '\n';

    // Application domain gauges
    output += '# HELP smackgym_system_status System health status (1 = healthy, 0 = degraded).\n';
    output += '# TYPE smackgym_system_status gauge\n';
    output += `smackgym_system_status 1\n`;

    return output;
  }
}

export const metricsRegistry = new MetricsRegistry();

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.baseUrl || req.path || '/';
    // Normalize route to avoid high cardinality
    const cleanRoute = route.replace(/[0-9a-fA-F-]{36}/g, ':id').split('?')[0] || '/';
    metricsRegistry.recordRequest(req.method, cleanRoute, res.statusCode, duration);
  });
  next();
}
