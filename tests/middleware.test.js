const authMiddleware = require('../src/middlewares/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

it('deve chamar next() com token válido', () => {
  jwt.verify.mockReturnValue({ id: 42 });

  const req = { headers: { authorization: 'Bearer tokenvalido' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  authMiddleware(req, res, next);

  expect(next).toHaveBeenCalled();
  expect(req.userId).toBe(42);
});

it('deve retornar 401 quando nenhum token é fornecido', () => {
  const req = { headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  authMiddleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(next).not.toHaveBeenCalled();
});

it('deve retornar 401 quando o token não tem o prefixo Bearer', () => {
  const req = { headers: { authorization: 'tokeninvalido' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  authMiddleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(next).not.toHaveBeenCalled();
});

it('deve retornar 401 quando o token é inválido', () => {
  jwt.verify.mockImplementation(() => { throw new Error('token inválido'); });

  const req = { headers: { authorization: 'Bearer tokeninvalido' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  authMiddleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(next).not.toHaveBeenCalled();
});

it('deve salvar o userId no req quando o token é válido', () => {
  jwt.verify.mockReturnValue({ id: 99 });

  const req = { headers: { authorization: 'Bearer tokenvalido' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  authMiddleware(req, res, next);

  expect(req.userId).toBe(99);
});