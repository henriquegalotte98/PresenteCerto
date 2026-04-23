import express from 'express';
import pool from '../database/db.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/comprovantes/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Convidado se compromete com um produto
router.post('/comprometer', async (req, res) => {
  const { id_produto, nome, email, telefone } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO convidados (id_produto, nome_convidado, email_convidado, telefone, status) 
       VALUES ($1, $2, $3, $4, 'comprometido')
       ON CONFLICT (id_produto, email_convidado) DO NOTHING
       RETURNING *`,
      [id_produto, nome, email, telefone]
    );
    
    res.json({ success: true, convite: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Confirmar compra com nota fiscal
router.post('/confirmar/:id_produto', upload.single('comprovante'), async (req, res) => {
  const { id_produto } = req.params;
  const { email, nota_fiscal } = req.body;
  const comprovante = req.file ? `/uploads/comprovantes/${req.file.filename}` : null;
  
  try {
    const result = await pool.query(
      `UPDATE convidados 
       SET status = 'confirmado', nota_fiscal = $1, comprovante = $2, data_compra = NOW()
       WHERE id_produto = $3 AND email_convidado = $4
       RETURNING *`,
      [nota_fiscal, comprovante, id_produto, email]
    );
    
    // Atualizar status do produto
    await pool.query(
      'UPDATE produtos SET comprado = true WHERE id_produto = $1',
      [id_produto]
    );
    
    res.json({ success: true, convite: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Buscar presentes que o convidado se comprometeu
router.get('/meus-presentes/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT c.*, p.nome, p.preco, p.foto, p.link, e.titulo as evento_titulo, e.data_evento
       FROM convidados c
       JOIN produtos p ON c.id_produto = p.id_produto
       JOIN eventos e ON p.id_evento = e.id_evento
       WHERE c.email_convidado = $1
       ORDER BY c.data_compra DESC`,
      [email]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;