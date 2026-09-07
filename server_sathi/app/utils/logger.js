import winston from 'winston';
import 'winston-daily-rotate-file';
// Log format define kar rahe hain
const logFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.json() // JSON format taaki baad me search/filter karna aasan ho
);
const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        // Console pe print karne ke liye (Development ke liye)
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
        // API calls aur regular actions yahan save honge
        new winston.transports.DailyRotateFile({
            filename: 'logs/activity-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'info',
            maxFiles: '14d', // 14 din purane logs auto-delete ho jayenge
        }),
        // Sirf errors yahan save honge
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '30d',
        }),
    ],
});
export default logger;
//# sourceMappingURL=logger.js.map