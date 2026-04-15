const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/database');

// Limpar o banco antes de cada teste
beforeEach(() => {
  db.prepare('DELETE FROM tasks').run();
  db.prepare('DELETE FROM users').run();
});

describe('POST /auth/register', () => {
  it('deve criar um novo usuário', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'nova@email.com', password: '123456' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Usuário criado com sucesso');
  });

  it('deve rejeitar e-mail duplicado', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'dup@email.com', password: '123456' });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'dup@email.com', password: '123456' });

    expect(res.status).toBe(409);
  });

  it('deve rejeitar campos vazios', async () => {
    const res = await request(app).post('/auth/register').send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'login@email.com', password: '123456' });
  });

  it('deve retornar um token ao fazer login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'login@email.com', password: '123456' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('deve rejeitar senha incorreta', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'login@email.com', password: 'senhaerrada' });

    expect(res.status).toBe(401);
  });
});