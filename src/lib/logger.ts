import { type Logger, LogLevel, setLogger, setLogLevel } from "@google/adk";

/**
 * Configures ADK's logger.
 *
 * Two complementary APIs are available:
 *
 *   setLogger(impl)    — replaces the entire logger with any object that
 *                        satisfies the Logger interface (debug/info/warn/error).
 *                        Use this to integrate pino, winston, etc.
 *
 *   setLogLevel(level) — filters ADK's built-in console logger by threshold.
 *                        Only effective when using the default SimpleLogger
 *                        (i.e. you have NOT called setLogger with a custom impl).
 */

// --- Custom logger using console (default) ---
// All ADK-internal logs are routed through this object.
//
// To swap in pino, replace this block with:
//
//   import pino from "pino";
//   const pinoLogger = pino();
//   setLogger({
//     log:   (level, ...args) => pinoLogger[LogLevel[level].toLowerCase() as "debug" | "info" | "warn" | "error"](...args),
//     debug: (...args) => pinoLogger.debug(...args),
//     info:  (...args) => pinoLogger.info(...args),
//     warn:  (...args) => pinoLogger.warn(...args),
//     error: (...args) => pinoLogger.error(...args),
//   });
//
const adkLogger: Logger = {
  log: (level, ...args) =>
    adkLogger[LogLevel[level].toLowerCase() as keyof Omit<Logger, "log">](
      ...args,
    ),
  debug: (...args) => console.debug("[ADK]", ...args),
  info: (...args) => console.info("[ADK]", ...args),
  warn: (...args) => console.warn("[ADK]", ...args),
  error: (...args) => console.error("[ADK]", ...args),
};

setLogger(adkLogger);

// --- Log level (only relevant if you remove setLogger above and revert to the
//     built-in SimpleLogger, which respects setLogLevel) ---
// Defaults to INFO. Set LOG_LEVEL=debug in your environment for verbose output.
const envLevel = process.env.LOG_LEVEL?.toUpperCase();
setLogLevel(envLevel === "DEBUG" ? LogLevel.DEBUG : LogLevel.INFO);
