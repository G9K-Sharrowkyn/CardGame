import request from 'supertest';
import http from 'http';
import app from '../app.js';

const server = http.createServer(app);

describe('Auth endpoints', () => {
  beforeAll(done => server.listen(0, done));
  afterAll(done => server.close(done));

  test('register and login', async () => {
    const email = `test_${Date.now()}@example.com`;
    const resReg = await request(server)
      .post('/api/auth/register')
      .send({ username: 'test', email, password: 'pass123' })
      .expect(201);
    expect(resReg.body).toHaveProperty('token');

    const resLog = await request(server)
      .post('/api/auth/login')
      .send({ email, password: 'pass123' })
      .expect(200);
    expect(resLog.body).toHaveProperty('token');
  });
});
