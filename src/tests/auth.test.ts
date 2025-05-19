import request from 'supertest';
import app from '../app';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('test-salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn().mockReturnValue({ id: 'test-id', username: 'testuser', email: 'test@example.com' })
}));

// Mock Supabase client
jest.mock('../config/db', () => {
  const mockSingle = jest.fn();
  return {
    __esModule: true,
    default: {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      single: mockSingle
    }
  };
});

describe('Auth Endpoints', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  const mockUser = {
    id: 'test-id',
    username: testUser.username,
    email: testUser.email,
    passwordHash: 'hashed-password',
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      // Mock successful user creation
      const { default: supabase } = await import('../config/db');
      (supabase as any).single.mockResolvedValueOnce({ data: null, error: null }); // Check existing user
      (supabase as any).single.mockResolvedValueOnce({ data: mockUser, error: null }); // Create user

      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.username).toBe(testUser.username);
    });

    it('should not create user with existing email', async () => {
      // Mock existing user
      const { default: supabase } = await import('../config/db');
      (supabase as any).single.mockResolvedValueOnce({ data: mockUser, error: null });

      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Mock successful login
      const { default: supabase } = await import('../config/db');
      (supabase as any).single.mockResolvedValueOnce({ data: mockUser, error: null });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should not login with invalid password', async () => {
      // Mock user not found
      const { default: supabase } = await import('../config/db');
      (supabase as any).single.mockResolvedValueOnce({ data: null, error: null });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpass'
        });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let refreshToken: string;

    beforeAll(async () => {
      // Mock successful login to get refresh token
      const { default: supabase } = await import('../config/db');
      (supabase as any).single.mockResolvedValueOnce({ data: mockUser, error: null });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      refreshToken = res.body.data.refreshToken;
    });

    it('should refresh token with valid refresh token', async () => {
      // Mock user found
      const { default: supabase } = await import('../config/db');
      (supabase as any).single.mockResolvedValueOnce({ data: mockUser, error: null });

      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should not refresh token with invalid refresh token', async () => {
      // Mock jwt.verify to throw an error for invalid token
      const jwt = await import('jsonwebtoken');
      (jwt.verify as jest.Mock).mockImplementationOnce(() => { throw { name: 'JsonWebTokenError' }; });

      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
}); 