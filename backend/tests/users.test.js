const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

describe('Users API', () => {
  let adminToken;
  let userToken;
  let adminId;
  let userId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/user-management-test');
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: 'Admin1234',
      fullName: 'Admin User',
      role: 'admin',
      status: 'active'
    });
    adminId = adminUser._id;

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin1234'
      });
    adminToken = adminLogin.body.data.token;

    // Create regular user
    const regularUser = await User.create({
      email: 'user@example.com',
      password: 'User1234',
      fullName: 'Regular User',
      role: 'user',
      status: 'active'
    });
    userId = regularUser._id;

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'User1234'
      });
    userToken = userLogin.body.data.token;
  });

  describe('GET /api/users (Admin only)', () => {
    it('should get all users with pagination (admin)', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:userId/activate', () => {
    it('should activate a user (admin)', async () => {
      // First deactivate the user
      await User.findByIdAndUpdate(userId, { status: 'inactive' });

      const response = await request(app)
        .put(`/api/users/${userId}/activate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.status).toBe('active');
    });

    it('should reject activation by non-admin', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}/activate`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fullName: 'Updated Name',
          email: 'updated@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.fullName).toBe('Updated Name');
      expect(response.body.data.user.email).toBe('updated@example.com');
    });
  });

  describe('PUT /api/users/change-password', () => {
    it('should change password with valid current password', async () => {
      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'User1234',
          newPassword: 'NewPass1234'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'NewPass1234'
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should reject password change with wrong current password', async () => {
      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPass1234'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});

