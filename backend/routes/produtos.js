import express from 'express';
import pool from '../database/db.js';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Criar produto
router.post('/', authMiddleware, upload.single('foto'), async (req, res) => {
  console.log('=== DADOS RECEBIDOS ===');
  console.log('Body:', req.body);
  console.log('File:', req.file);
  
  const { id_evento, nome, preco, link, observacao } = req.body;
  const id_usuario = req.usuarioId;
  
  // Validação
  if (!id_evento) {
    return res.status(400).json({ error: 'ID do evento é obrigatório' });
  }
  if (!nome) {
    return res.status(400).json({ error: 'Nome do produto é obrigatório' });
  }
  if (!preco) {
    return res.status(400).json({ error: 'Preço do produto é obrigatório' });
  }
  
  try {
    // Verificar permissão
    const eventoCheck = await pool.query(
      'SELECT id_dono FROM eventos WHERE id_evento = $1',
      [id_evento]
    );
    
    if (eventoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    const isDono = eventoCheck.rows[0].id_dono === id_usuario;
    const colaboradorCheck = await pool.query(
      'SELECT 1 FROM colaboradores WHERE id_evento = $1 AND id_usuario = $2',
      [id_evento, id_usuario]
    );
    
    if (!isDono && colaboradorCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    // Caminho da foto
    let fotoPath = null;
    if (req.file) {
      fotoPath = `/uploads/${req.file.filename}`;
      console.log('📸 Foto salva em:', fotoPath);
    }
    
    // Inserir no banco
    const result = await pool.query(
      `INSERT INTO produtos (id_evento, nome, preco, link, foto, observacao, comprado) 
       VALUES ($1, $2, $3, $4, $5, $6, false) 
       RETURNING *`,
      [id_evento, nome, preco, link || null, fotoPath, observacao || null]
    );
    
    console.log('✅ Produto criado ID:', result.rows[0].id_produto);
    console.log('📸 Foto no banco:', result.rows[0].foto);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar produtos do evento
router.get('/evento/:id_evento', async (req, res) => {
  const { id_evento } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT p.*, 
              COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                  'nome', c.nome_convidado,
                  'email', c.email_convidado,
                  'status', c.status
                )) FILTER (WHERE c.id_convite IS NOT NULL), '[]'
              ) as convidados
       FROM produtos p
       LEFT JOIN convidados c ON p.id_produto = c.id_produto
       WHERE p.id_evento = $1
       GROUP BY p.id_produto
       ORDER BY p.id_produto`,
      [id_evento]
    );
    
    console.log(`📦 ${result.rows.length} produtos carregados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Editar produto
router.put('/:id', authMiddleware, upload.single('foto'), async (req, res) => {
  const { id } = req.params;
  const { nome, preco, link, observacao } = req.body;
  const id_usuario = req.usuarioId;
  
  try {
    // Buscar produto atual
    const produtoAtual = await pool.query(
      'SELECT * FROM produtos WHERE id_produto = $1',
      [id]
    );
    
    if (produtoAtual.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Verificar permissão
    const eventoCheck = await pool.query(
      'SELECT id_dono FROM eventos WHERE id_evento = $1',
      [produtoAtual.rows[0].id_evento]
    );
    
    const isDono = eventoCheck.rows[0].id_dono === id_usuario;
    const colaboradorCheck = await pool.query(
      'SELECT 1 FROM colaboradores WHERE id_evento = $1 AND id_usuario = $2',
      [produtoAtual.rows[0].id_evento, id_usuario]
    );
    
    if (!isDono && colaboradorCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    // Atualizar foto se houver nova
    let fotoPath = produtoAtual.rows[0].foto;
    if (req.file) {
      // Deletar foto antiga
      if (fotoPath) {
        const oldFile = `.${fotoPath}`;
        if (fs.existsSync(oldFile)) {
          fs.unlinkSync(oldFile);
        }
      }
      fotoPath = `/uploads/${req.file.filename}`;
    }
    
    const result = await pool.query(
      `UPDATE produtos 
       SET nome = $1, preco = $2, link = $3, observacao = $4, foto = $5
       WHERE id_produto = $6 
       RETURNING *`,
      [nome, preco, link || null, observacao || null, fotoPath, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deletar produto
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.usuarioId;
  
  try {
    const produto = await pool.query(
      'SELECT * FROM produtos WHERE id_produto = $1',
      [id]
    );
    
    if (produto.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Verificar permissão
    const eventoCheck = await pool.query(
      'SELECT id_dono FROM eventos WHERE id_evento = $1',
      [produto.rows[0].id_evento]
    );
    
    const isDono = eventoCheck.rows[0].id_dono === id_usuario;
    const colaboradorCheck = await pool.query(
      'SELECT 1 FROM colaboradores WHERE id_evento = $1 AND id_usuario = $2',
      [produto.rows[0].id_evento, id_usuario]
    );
    
    if (!isDono && colaboradorCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    // Deletar arquivo de imagem
    if (produto.rows[0].foto) {
      const filePath = `.${produto.rows[0].foto}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await pool.query('DELETE FROM produtos WHERE id_produto = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;