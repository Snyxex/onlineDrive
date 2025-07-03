import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as fs from 'fs';
import * as path from 'path';

// Define a custom interface for the logger to ensure type safety
interface AppLogger {
  info: (message: string, metadata?: Record<string, any>) => void;
  error: (message: string, metadata?: Record<string, any>) => void;
  warn: (message: string, metadata?: Record<string, any>) => void;
  debug: (message: string, metadata?: Record<string, any>) => void;
}

const logsPath = path.join(__dirname, '../../../logs');

// Ensure the logs directory exists before creating the logger
if (!fs.existsSync(logsPath)) {
  try {
    fs.mkdirSync(logsPath, { recursive: true });
    console.log(`Logs directory created at: ${logsPath}`); // Informative message
  } catch (err) {
    console.error(`Failed to create logs directory: ${logsPath}`, err);
    // Depending on criticality, you might want to throw an error or exit here
  }
}

export function getLogger(moduleName: string, level: string = process.env.LOG_LEVEL || 'info'): AppLogger {
  // Define the custom text format for file logs
  const fileLogFormat = format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}] [${moduleName}] - ${message}`;

    // Append stack trace for errors if available
    if (stack) {
      logMessage += `\n${stack}`;
    }

    // Append other metadata if available and not empty
    const metaKeys = Object.keys(metadata).filter(key => key !== 'level' && key !== 'message' && key !== 'timestamp' && key !== 'stack');
    if (metaKeys.length > 0) {
      logMessage += ` ${JSON.stringify(metadata)}`;
    }
    return logMessage;
  });

  const logger: WinstonLogger = createLogger({
    level: level,
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add a precise timestamp
      format.errors({ stack: true }), // Include stack trace for errors
      format.splat() // Important for handling string interpolation and objects in messages
    ),
    transports: [
      // File transport with daily rotation and custom text format
      new DailyRotateFile({
        dirname: logsPath,
        filename: `${moduleName}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxFiles: '4d', // Keep logs for 4 days
        zippedArchive: true, // Compress old log files
        maxSize: '20m', // Rotate file if it exceeds 20MB
        format: fileLogFormat, // Apply the custom text format here
      }),
      // Console transport for real-time visibility during development
    
    ],
  });

  // Return a wrapper object for type safety and consistent API
  return {
    info: (message: string, metadata?: Record<string, any>) => logger.info(message, metadata),
    error: (message: string, metadata?: Record<string, any>) => {
      // Ensure stack trace is captured correctly, especially for error objects
      if (metadata instanceof Error) {
        logger.error(message, { ...metadata, stack: metadata.stack });
      } else {
        logger.error(message, metadata);
      }
    },
    warn: (message: string, metadata?: Record<string, any>) => logger.warn(message, metadata),
    debug: (message: string, metadata?: Record<string, any>) => logger.debug(message, metadata),
  };
}