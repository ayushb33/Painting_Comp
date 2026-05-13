import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt.js';
import { loginSchema } from '../validators/auth.validator.js';
import { successResponse, errorResponse } from '../utils/response.js';

const prisma = new PrismaClient();

const USER_MODELS = {
  ADMIN: { model: prisma.admin, idField: 'admin_id' },
  TEACHER: { model: prisma.school, idField: 'school_id' },
  JUDGE: { model: prisma.judge, idField: 'judge_id' },
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = loginSchema.parse(req.body);

    let user;
    if (role === 'ADMIN') {
      user = await prisma.admin.findUnique({ where: { email } });
    } else if (role === 'TEACHER') {
      user = await prisma.school.findUnique({ where: { email } });
    } else if (role === 'JUDGE') {
      user = await prisma.judge.findUnique({ where: { email } });
    }

    if (!user) return errorResponse(res, 'Invalid credentials', 401);

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return errorResponse(res, 'Invalid credentials', 401);

    const payload = { id: user.id, email: user.email, role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: { token: refreshToken, user_id: user.id, user_type: role, expires_at: expiresAt }
    });

    const userData = { id: user.id, email: user.email, role };
    if (role === 'TEACHER') {
      userData.school_name = user.school_name;
      userData.teacher_name = user.teacher_name;
      userData.profile_completed = user.profile_completed;
    } else if (role === 'JUDGE') {
      userData.name = user.name;
    } else {
      userData.name = user.name;
    }

    return successResponse(res, { user: userData, accessToken, refreshToken }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return errorResponse(res, 'Refresh token required', 400);

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expires_at < new Date()) {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }

    const decoded = verifyRefreshToken(token);
    const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
    const newAccessToken = generateAccessToken(payload);

    return successResponse(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    return successResponse(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};