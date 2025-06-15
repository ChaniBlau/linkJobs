import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
 const PORT = process.env.PORT || 3000;


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.send('Server is running');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});