import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import artistsRouter from './routes/artists.js';
import profileRouter from './routes/profile.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/artists', artistsRouter);
app.use('/api/profile', profileRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
