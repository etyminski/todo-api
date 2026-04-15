const express = require('express');
const db = require('../database/database');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Todas as rotas deste arquivo exigem autenticação
router.use(authMiddleware);

// GET /tasks — Listar todas as tarefas do usuário
router.get('/', (req, res) => {
  try {
    const tasks = db
      .prepare('SELECT id, title, completed FROM tasks WHERE user_id = ?')
      .all(req.userId);

    // Converter completed de 0/1 para false/true
    const formattedTasks = tasks.map((task) => ({
      ...task,
      completed: task.completed === 1,
    }));

    res.json(formattedTasks);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /tasks — Criar uma nova tarefa
router.post('/', (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'O título é obrigatório' });
    }

    const result = db
      .prepare('INSERT INTO tasks (title, user_id) VALUES (?, ?)')
      .run(title, req.userId);

    res.status(201).json({
      id: result.lastInsertRowid,
      title,
      completed: false,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /tasks/:id — Atualizar uma tarefa
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    // Verificar se a tarefa existe E pertence ao usuário
    const task = db
      .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
      .get(id, req.userId);

    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    // Atualizar apenas os campos que foram enviados
    const newTitle = title !== undefined ? title : task.title;
    const newCompleted = completed !== undefined ? (completed ? 1 : 0) : task.completed;

    db.prepare('UPDATE tasks SET title = ?, completed = ? WHERE id = ? AND user_id = ?')
      .run(newTitle, newCompleted, id, req.userId);

    res.json({
      id: Number(id),
      title: newTitle,
      completed: newCompleted === 1,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /tasks/:id — Excluir uma tarefa
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a tarefa existe E pertence ao usuário
    const task = db
      .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
      .get(id, req.userId);

    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(id, req.userId);

    res.json({ message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;