import express from 'express';
import pool from '../database/db.js';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const router = express.Router();

// Configuração do multer em memória
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Função auxiliar para upload via stream
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder: "presente-certo/produtos" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Criar produto
router.post('/', authMiddleware, upload.single('foto'), async (req, res) => {
  const { id_evento, nome, preco, link, observacao } = req.body;
  const id_usuario = req.usuarioId;
  
  if (!id_evento || !nome || !preco) {
    return res.status(400).json({ error: 'Dados obrigatórios faltando' });
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
    
    // Upload para Cloudinary se houver arquivo
    let fotoUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      fotoUrl = result.secure_url;
      console.log('📸 Foto no Cloudinary:', fotoUrl);
    }
    
    // Inserir no banco
    const result = await pool.query(
      `INSERT INTO produtos (id_evento, nome, preco, link, foto, observacao, comprado) 
       VALUES ($1, $2, $3, $4, $5, $6, false) 
       RETURNING *`,
      [id_evento, nome, preco, link || null, fotoUrl, observacao || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro no upload:', error);
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
    
    // Atualizar foto se houver nova
    let fotoUrl = produtoAtual.rows[0].foto;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      fotoUrl = result.secure_url;
    }
    
    const result = await pool.query(
      `UPDATE produtos 
       SET nome = $1, preco = $2, link = $3, observacao = $4, foto = $5
       WHERE id_produto = $6 
       RETURNING *`,
      [nome, preco, link || null, observacao || null, fotoUrl, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro na edição:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deletar produto
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.usuarioId;
  
  try {
    // Apenas deletar do banco. (Se quiser deletar do Cloudinary precisaria do PublicID)
    await pool.query('DELETE FROM produtos WHERE id_produto = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao deletar:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;