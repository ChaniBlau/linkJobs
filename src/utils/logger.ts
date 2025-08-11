import { createLogger, format, transports } from 'winston';

// הגדרת ה-logger עם Winston
const logger = createLogger({
  level: 'info', // רמת הלוג שמתחילים ממנה להציג
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // מוסיף תאריך וזמן ללוג
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    }),
  ),
  transports: [
    new transports.Console(), // לוגים יוצגו גם בקונסולה (לנוחות בפיתוח)
    new transports.File({ filename: 'error.log', level: 'error' }), // שומר שגיאות בלבד בקובץ נפרד
    new transports.File({ filename: 'combined.log' }), // שומר את כל הלוגים בקובץ אחד
  ],
});

export default logger;
