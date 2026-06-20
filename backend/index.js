import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'
import dossierRoutes from './routes/dossierRoutes.js';
import { requestLogger } from './middlewares/requestLogger.js';
import alertRoutes from './routes/alertRoutes.js'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
if (!PORT){
    console.log("cannot get port from the env vars...");
    console.log("falling back to default port 5000");
    PORT=5000;
    
}
app.use(cors({
    origin: '*',
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger)

// Handle malformed JSON bodies — without this Express returns HTML
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, error: 'Corps de requête JSON invalide' });
    }
    next(err);
});

app.use('/api/auth', authRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alertes', alertRoutes)

app.listen(PORT, () => {
    console.log(`Le Serveur écoute sur le port ${PORT}`);
});
