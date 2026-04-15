const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/database');

const router = express.Router();

// rota -> POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const userExists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (userExists) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir o usuário no banco
    db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hashedPassword);

    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    const senhaCorreta = await bcrypt.compare(password, user.password);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    // gera o token JWT!!!
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;