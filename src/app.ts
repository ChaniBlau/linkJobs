import authRoutes from '../src/routes/auth.routes';
import jobRoutes from '../src/routes/job.routes';
import orgRoutes from './routes/organization.router';
import { authenticate } from './middlewares/auth.middleware';
import { authorize } from './middlewares/authorize.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import express from 'express';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/orgs', orgRoutes);

// דוגמאות:

app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Access granted!' });
});
// Route שדורש גם התחברות וגם הרשאה לתפקיד admin

app.get('/api/admin-data', authenticate, authorize(['admin']), (req, res) => {
  res.json({ message: 'Admin access granted!' });
});

// Route שמטרתו לבדוק טיפול בשגיאות כלליות

app.get('/api/error', (req, res) => {
  throw new Error('Intentional error');
});

app.use(errorHandler);

export default app;
// // Route לדוגמה שדורש רק התחברות בטוקן
// app.get('/api/protected', authenticate, (req, res) => {
//     // res.json({ message: 'Access granted!', userId: req.userId, role: req.userRole });
//     // res.json({ message: 'Access granted!', role: req.userRole });
//     res.json({ message: 'Access granted!'});
//   });



