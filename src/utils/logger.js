import fs from 'fs';
import path from 'path';
import winston from 'winston';

const logsDir = path.resolve('logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}] ${message}`)
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'run.log'), maxsize: 1024*1024 }),
    new winston.transports.Console()
  ]
});
