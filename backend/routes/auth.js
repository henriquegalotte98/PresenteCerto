import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/db.js';

const router = express.Router();

// Cadastro
router.post('/registro', async (req, res) => {
  const { nome, email, senha, tipo } = req.body;
  
  try {
    const hashedSenha = await bcrypt.hash(senha, 10);
    
    // Se for dono, criar como admin
    // Se for convidado, criar como usuário normal
    const isAdmin = tipo === 'dono';
    
    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, is_admin) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id_usuario, nome, email, is_admin`,
      [nome, email, hashedSenha, isAdmin]
    );
    
    const token = jwt.sign(
      { 
        id: result.rows[0].id_usuario, 
        email, 
        isAdmin: result.rows[0].is_admin 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      user: {
        id_usuario: result.rows[0].id_usuario,
        nome: result.rows[0].nome,
        email: result.rows[0].email,
        is_admin: result.rows[0].is_admin
      }, 
      token 
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(400).json({ error: 'Erro ao cadastrar: ' + error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    const token = jwt.sign(
      { 
        id: usuario.id_usuario, 
        email: usuario.email, 
        isAdmin: usuario.is_admin || false
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      user: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        is_admin: usuario.is_admin || false
      },
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no login' });
  }
});

export default router;