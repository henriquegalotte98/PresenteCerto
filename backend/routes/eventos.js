import express from 'express';
import pool from '../database/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Gerar código único
function gerarCodigo() {
  return uuidv4().slice(0, 8).toUpperCase();
}

// Criar novo evento - QUALQUER usuário logado pode criar
router.post('/', authMiddleware, async (req, res) => {
  const { titulo, descricao, data_evento, local, mapa_link } = req.body;
  const id_usuario = req.usuarioId;
  
  try {
    const codigo = gerarCodigo();
    
    // Se o usuário não for admin, tornar admin agora
    const userCheck = await pool.query(
      'SELECT is_admin FROM usuarios WHERE id_usuario = $1',
      [id_usuario]
    );
    
    if (!userCheck.rows[0].is_admin) {
      // Tornar usuário admin
      await pool.query(
        'UPDATE usuarios SET is_admin = true WHERE id_usuario = $1',
        [id_usuario]
      );
    }
    
    const result = await pool.query(
      `INSERT INTO eventos (codigo, titulo, descricao, data_evento, local, mapa_link, id_dono) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [codigo, titulo, descricao, data_evento, local, mapa_link, id_usuario]
    );
    
    res.json({ evento: result.rows[0], codigo });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(400).json({ error: error.message });
  }
});

//Deletar evento
router.delete('/:id_evento', authMiddleware, async (req, res) => {
  const { id_evento } = req.params;
  const id_usuario = req.usuarioId;
  
  try {
    const result = await pool.query(
      'DELETE FROM eventos WHERE id_evento = $1 AND id_dono = $2 RETURNING *',
      [id_evento, id_usuario]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.json({ success: true, message: 'Evento deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Buscar todos os eventos do usuário (para exibir no "Meus Eventos")
router.get('/meus-eventos', authMiddleware, async (req, res) => {
  const id_usuario = req.usuarioId;
  
  try {
    const result = await pool.query(
      `SELECT * FROM eventos 
       WHERE id_dono = $1 
       ORDER BY data_evento DESC`,
      [id_usuario]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar evento por ID (para edição)
router.get('/:id_evento', authMiddleware, async (req, res) => {
  const { id_evento } = req.params;
  const id_usuario = req.usuarioId;
  
  try {
    const result = await pool.query(
      `SELECT e.*, 
              EXISTS(SELECT 1 FROM colaboradores c WHERE c.id_evento = e.id_evento AND c.id_usuario = $2) as is_colaborador
       FROM eventos e 
       WHERE e.id_evento = $1 AND (e.id_dono = $2 OR EXISTS(SELECT 1 FROM colaboradores c WHERE c.id_evento = e.id_evento AND c.id_usuario = $2))`,
      [id_evento, id_usuario]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar evento por código (público)
router.get('/buscar/:codigo', async (req, res) => {
  const { codigo } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT e.*, u.nome as dono_nome 
       FROM eventos e 
       JOIN usuarios u ON e.id_dono = u.id_usuario 
       WHERE e.codigo = $1`,
      [codigo.toUpperCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar produtos do evento
router.get('/:id_evento/produtos', async (req, res) => {
  const { id_evento } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT p.*, 
              json_agg(DISTINCT jsonb_build_object(
                'nome', c.nome_convidado,
                'email', c.email_convidado,
                'status', c.status
              )) FILTER (WHERE c.id_convite IS NOT NULL) as convidados
       FROM produtos p
       LEFT JOIN convidados c ON p.id_produto = c.id_produto
       WHERE p.id_evento = $1
       GROUP BY p.id_produto
       ORDER BY p.id_produto`,
      [id_evento]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Adicionar colaborador (cônjuge)
router.post('/colaborador', authMiddleware, async (req, res) => {
  const { email_colaborador, codigo_evento } = req.body;
  const id_dono = req.usuarioId;
  
  try {
    // Buscar evento pelo código
    const evento = await pool.query(
      'SELECT id_evento FROM eventos WHERE codigo = $1 AND id_dono = $2',
      [codigo_evento, id_dono]
    );
    
    if (evento.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    // Buscar usuário colaborador
    const colaborador = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = $1',
      [email_colaborador]
    );
    
    if (colaborador.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Adicionar como colaborador e também tornar admin
    await pool.query(
      'INSERT INTO colaboradores (id_evento, id_usuario) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [evento.rows[0].id_evento, colaborador.rows[0].id_usuario]
    );
    
    // Tornar o colaborador admin também
    await pool.query(
      'UPDATE usuarios SET is_admin = true WHERE id_usuario = $1',
      [colaborador.rows[0].id_usuario]
    );
    
    res.json({ success: true, message: 'Colaborador adicionado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;