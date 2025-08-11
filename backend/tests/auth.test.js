import request from 'supertest';
import { server } from '../app.js';

describe('Auth endpoints', () => {
  beforeAll((done) => {
    server.listen(0, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test('register and login', async () => {
    const timestamp = Date.now();
    const email = `test_${timestamp}@example.com`;
    const username = `test_${timestamp}`;

    const resReg = await request(server)
      .post('/api/auth/register')
      .send({ username, email, password: 'pass123' })
      .expect(201);
    expect(resReg.body).toHaveProperty('token');

    const resLog = await request(server)
      .post('/api/auth/login')
      .send({ username, password: 'pass123' })
      .expect(200);
    expect(resLog.body).toHaveProperty('token');
  });
});
