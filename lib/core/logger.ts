/**
 * Centralized logging utility with context support
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  staffId?: string;
  residentId?: string;
  action?: string;
  [key: string]: unknown;
}

class Logger {
  private context: LogContext = {};

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  clearContext() {
    this.context = {};
  }

  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const contextStr = Object.keys(this.context).length > 0
      ? JSON.stringify(this.context)
      : "";

    return {
      timestamp,
      level,
      message,
      context: this.context,
      ...meta,
    };
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      console.debug(JSON.stringify(this.formatMessage("debug", message, meta)));
    }
  }

  info(message: string, meta?: Record<string, unknown>) {
    console.info(JSON.stringify(this.formatMessage("info", message, meta)));
  }

  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(JSON.stringify(this.formatMessage("warn", message, meta)));
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>) {
    const errorMeta = error instanceof Error
      ? {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
        }
      : { error };

    console.error(
      JSON.stringify(this.formatMessage("error", message, { ...errorMeta, ...meta }))
    );
  }

  // Specialized logging methods
  logRequest(method: string, path: string, meta?: Record<string, unknown>) {
    this.info(`${method} ${path}`, { type: "request", ...meta });
  }

  logResponse(method: string, path: string, statusCode: number, duration: number) {
    this.info(`${method} ${path} - ${statusCode}`, {
      type: "response",
      statusCode,
      duration,
    });
  }

  logDatabaseQuery(query: string, duration: number) {
    this.debug("Database query", {
      type: "database",
      query,
      duration,
    });
  }

  logAudit(action: string, entityType: string, entityId: string, meta?: Record<string, unknown>) {
    this.info("Audit log", {
      type: "audit",
      action,
      entityType,
      entityId,
      ...meta,
    });
  }
}

export const logger = new Logger();
