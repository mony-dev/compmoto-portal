import winston from 'winston';
import path from 'path';

// Configure Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(process.cwd(), 'logs/error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(process.cwd(), 'logs/combined.log') })
  ],
});

export default logger;
