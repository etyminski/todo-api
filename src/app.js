// configs iniciais do servidor
// dotenv → carrega configs
// express() → cria servidor
// middleware → processa requisição
// app.get() → define rota
// app.use() → conecta módulos de rota
// module.exports → exporta o app

require('dotenv').config();
const express = require('express');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// Middleware para entender JSON no body das requisições
app.use(express.json());

// Rota de teste (para verificar se a API está no ar)
app.get('/', (req, res) => {
  res.json({ message: 'API To-Do funcionando!' });
});

// Registrar as rotas
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

module.exports = app;