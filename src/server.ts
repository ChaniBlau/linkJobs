import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined in environment variables!');
  process.exit(1);
  }
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
