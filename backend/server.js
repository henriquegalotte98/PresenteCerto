import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pool from './database/db.js';
import authRoutes from './routes/auth.js';
import eventoRoutes from './routes/eventos.js';
import produtoRoutes from './routes/produtos.js';
import convidadoRoutes from './routes/convidados.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Criar pastas necessárias (Mudar para ser condicional ou usar /tmp em produção)
try {
  const uploadsDir = path.join(__dirname, 'uploads');
  const comprovantesDir = path.join(uploadsDir, 'comprovantes');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Pasta uploads criada');
  }
  if (!fs.existsSync(comprovantesDir)) {
    fs.mkdirSync(comprovantesDir, { recursive: true });
    console.log('📁 Pasta comprovantes criada');
  }
} catch (err) {
  console.log('⚠️ Ambiente Read-only ou erro ao criar pastas. Pulando...');
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://presente-certo-9r8fg0vrs-henriquegalotte98s-projects.vercel.app',
    /^https:\/\/presente-certo.*\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (IMPORTANTE: deve ser antes das rotas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log(`📁 Servindo arquivos estáticos de: ${path.join(__dirname, 'uploads')}`);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/convidados', convidadoRoutes);

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Rota para listar arquivos de upload (debug)
app.get('/api/uploads-list', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      files: files.filter(f => f !== 'comprovantes').map(f => ({
        name: f,
        url: `http://localhost:${PORT}/uploads/${f}`
      }))
    });
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`🔍 Debug uploads: http://localhost:${PORT}/api/uploads-list\n`);
});



export default app;