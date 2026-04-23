import express from 'express';
import pool from '../database/db.js';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/comprovantes/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Comprometer-se a comprar um produto
router.post('/comprometer', authMiddleware, async (req, res) => {
  const { id_produto } = req.body;
  const id_usuario = req.usuarioId;
  
  try {
    const result = await pool.query(
      `INSERT INTO compras (id_produto, id_usuario, status) 
       VALUES ($1, $2, 'comprometido') 
       ON CONFLICT (id_produto, id_usuario) DO NOTHING
       RETURNING *`,
      [id_produto, id_usuario]
    );
    
    res.json({ success: true, compra: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Confirmar compra com nota fiscal
router.post('/confirmar/:id_produto', authMiddleware, upload.single('comprovante'), async (req, res) => {
  const { id_produto } = req.params;
  const { nota_fiscal } = req.body;
  const id_usuario = req.usuarioId;
  const comprovante = req.file ? `/uploads/comprovantes/${req.file.filename}` : null;
  
  try {
    const result = await pool.query(
      `UPDATE compras 
       SET status = 'confirmado', nota_fiscal = $1, comprovante = $2, data_compra = NOW()
       WHERE id_produto = $3 AND id_usuario = $4
       RETURNING *`,
      [nota_fiscal, comprovante, id_produto, id_usuario]
    );
    
    // Atualizar status do produto
    await pool.query(
      'UPDATE produtos SET comprado = true WHERE id_produto = $1',
      [id_produto]
    );
    
    res.json({ success: true, compra: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Meus presentes comprometidos
router.get('/meus-presentes', authMiddleware, async (req, res) => {
  const id_usuario = req.usuarioId;
  
  try {
    const result = await pool.query(`
      SELECT c.*, p.*, c.status as compra_status
      FROM compras c
      JOIN produtos p ON c.id_produto = p.id_produto
      WHERE c.id_usuario = $1
      ORDER BY c.data_compra DESC
    `, [id_usuario]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remover compromisso
router.delete('/remover/:id_produto', authMiddleware, async (req, res) => {
  const { id_produto } = req.params;
  const id_usuario = req.usuarioId;
  
  try {
    await pool.query(
      'DELETE FROM compras WHERE id_produto = $1 AND id_usuario = $2',
      [id_produto, id_usuario]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;