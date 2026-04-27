const authMiddleware = require('../src/middlewares/auth');

jest.mock('jsonwebtoken', () => ({
  verify: () => ({ id: 42 })
}));

it('deve chamar next() com token válido', () => {
  const req = { headers: { authorization: 'Bearer tokenfalso' } };
  const res = {};
  const next = jest.fn();

  authMiddleware(req, res, next);

  expect(next).toHaveBeenCalled();
  expect(req.userId).toBe(42);
});