import winston from 'winston';
import path from 'path';

// Create a log directory if it does not exist
const logDir = path.join(process.cwd(), 'logs');
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Configure Winston
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
  ],
});

export default logger;
