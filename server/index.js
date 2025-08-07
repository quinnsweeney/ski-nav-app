import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { verifyJwt } from './middleware.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/v1', publicRoutes);
app.use('/api/admin', verifyJwt, adminRoutes);
app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})