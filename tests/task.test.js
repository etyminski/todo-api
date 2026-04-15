const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/database');

let token;

beforeEach(async () => {
  db.prepare('DELETE FROM tasks').run();
  db.prepare('DELETE FROM users').run();

  // Criar um usuário e obter o token
  await request(app)
    .post('/auth/register')
    .send({ email: 'tasks@email.com', password: '123456' });

  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'tasks@email.com', password: '123456' });

  token = res.body.token;
});

describe('POST /tasks', () => {
  it('deve criar uma nova tarefa', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Estudar Node.js' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Estudar Node.js');
    expect(res.body.completed).toBe(false);
  });

  it('deve rejeitar tarefa sem título', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('GET /tasks', () => {
  it('deve listar as tarefas do usuário', async () => {
    // Criar uma tarefa antes
    await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Tarefa teste' });

    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Tarefa teste');
  });

  it('deve retornar 401 sem token', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(401);
  });
});

describe('PUT /tasks/:id', () => {
  it('deve atualizar uma tarefa', async () => {
    const created = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Original' });

    const res = await request(app)
      .put(`/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Atualizado', completed: true });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Atualizado');
    expect(res.body.completed).toBe(true);
  });
});

describe('DELETE /tasks/:id', () => {
  it('deve excluir uma tarefa', async () => {
    const created = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Para excluir' });

    const res = await request(app)
      .delete(`/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Tarefa excluída com sucesso');
  });

  it('deve retornar 404 para tarefa inexistente', async () => {
    const res = await request(app)
      .delete('/tasks/9999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});