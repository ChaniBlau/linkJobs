// import dotenv from 'dotenv';
// import express from 'express';
// import helmet from 'helmet';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import authRoutes from '../src/routes/auth.routes';
// import jobRoutes from '../src/routes/job.routes';
// import orgRoutes from './routes/organization.router';
// import { authenticate } from './middlewares/auth.middleware';
// import { authorize } from './middlewares/authorize.middleware';
// import { errorHandler } from './middlewares/errorHandler.middleware';

// dotenv.config();
// const app = express();

// app.use(helmet());
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use('/api/auth', authRoutes);
// app.use('/api/jobs', jobRoutes);
// app.use('/api/orgs', orgRoutes);


// app.get('/health', (req, res) => {
//   res.send('Server is running');
// });



// app.get('/api/protected', authenticate, (req, res) => {
//   res.json({ message: 'Access granted!' });
// });
// // Route שדורש גם התחברות וגם הרשאה לתפקיד admin

// app.get('/api/admin-data', authenticate, authorize(['admin']), (req, res) => {
//   res.json({ message: 'Admin access granted!' });
// });

// // Route שמטרתו לבדוק טיפול בשגיאות כלליות

// app.get('/api/error', (req, res) => {
//   throw new Error('Intentional error');
// });

// app.use(errorHandler);

// export default app;




import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from '../src/routes/auth.routes';
import jobRoutes from '../src/routes/job.routes';
import orgRoutes from './routes/organization.router';

import { authenticate } from './middlewares/auth.middleware';
import { authorize } from './middlewares/authorize.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/orgs', orgRoutes);

app.get('/health', (req, res) => {
  res.send('Server is running');
});

// דוגמת ראוט שמצריך התחברות בלבד
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Access granted!' });
});

// דוגמת ראוט שדורש גם התחברות וגם הרשאה לפי תפקיד
app.get('/api/admin-data', authenticate, authorize(['admin']), (req, res) => {
  res.json({ message: 'Admin access granted!' });
});

// Route לבדיקת טיפול בשגיאות כלליות
app.get('/api/error', (req, res) => {
  throw new Error('Intentional error');
});

app.use(errorHandler);

export default app;
