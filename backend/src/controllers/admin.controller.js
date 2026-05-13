import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { createSchoolSchema, createJudgeSchema } from '../validators/auth.validator.js';
import { successResponse, errorResponse } from '../utils/response.js';

const prisma = new PrismaClient();

// ─── School Management ───────────────────────────────────────────────────────

export const createSchool = async (req, res, next) => {
  try {
    const data = createSchoolSchema.parse(req.body);
    const existing = await prisma.school.findUnique({ where: { email: data.email } });
    if (existing) return errorResponse(res, 'Email already registered', 409);

    const password_hash = await bcrypt.hash(data.password, 12);
    const school = await prisma.school.create({
      data: {
        school_name: data.school_name,
        teacher_name: data.teacher_name,
        email: data.email,
        password_hash,
        contact_number: data.contact_number,
        city: data.city,
        state: data.state,
      },
      select: { id: true, school_name: true, email: true, teacher_name: true, created_at: true }
    });
    return successResponse(res, school, 'School created successfully', 201);
  } catch (err) { next(err); }
};

export const listSchools = async (req, res, next) => {
  try {
    const { state, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (state) where.state = state;
    if (search) where.OR = [
      { school_name: { contains: search, mode: 'insensitive' } },
      { teacher_name: { contains: search, mode: 'insensitive' } },
    ];

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true, school_name: true, teacher_name: true, email: true,
          contact_number: true, city: true, state: true, profile_completed: true,
          created_at: true, _count: { select: { students: true } }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.school.count({ where })
    ]);

    return successResponse(res, {
      schools,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) { next(err); }
};

export const getSchoolStudents = async (req, res, next) => {
  try {
    const { schoolId } = req.params;
    const students = await prisma.student.findMany({
      where: { school_id: parseInt(schoolId) },
      include: {
        attendance: true,
        painting: { include: { scores: true } },
        result: true,
      },
      orderBy: { full_name: 'asc' }
    });
    return successResponse(res, students);
  } catch (err) { next(err); }
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalSchools, totalStudents, totalPaintings, approvedPaintings, schoolStats] = await Promise.all([
      prisma.school.count(),
      prisma.student.count(),
      prisma.painting.count(),
      prisma.painting.count({ where: { is_approved: true } }),
      prisma.school.findMany({
        select: {
          id: true, school_name: true, state: true,
          _count: { select: { students: true } }
        },
        orderBy: { students: { _count: 'desc' } },
        take: 10
      })
    ]);

    return successResponse(res, {
      totalSchools, totalStudents, totalPaintings, approvedPaintings, schoolStats
    });
  } catch (err) { next(err); }
};

// ─── Painting Approval ────────────────────────────────────────────────────────

export const getPaintingsBySchool = async (req, res, next) => {
  try {
    const { schoolId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [paintings, total] = await Promise.all([
      prisma.painting.findMany({
        where: { student: { school_id: parseInt(schoolId) } },
        skip, take: parseInt(limit),
        include: {
          student: { select: { id: true, full_name: true, unique_student_id: true, class: true, section: true } }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.painting.count({ where: { student: { school_id: parseInt(schoolId) } } })
    ]);

    return successResponse(res, {
      paintings,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) { next(err); }
};

export const approvePainting = async (req, res, next) => {
  try {
    const { paintingId } = req.params;
    const painting = await prisma.painting.update({
      where: { id: parseInt(paintingId) },
      data: { is_approved: true, approved_at: new Date() }
    });
    return successResponse(res, painting, 'Painting approved');
  } catch (err) { next(err); }
};

export const undoApprovePainting = async (req, res, next) => {
  try {
    const { paintingId } = req.params;
    const painting = await prisma.painting.update({
      where: { id: parseInt(paintingId) },
      data: { is_approved: false, approved_at: null }
    });
    return successResponse(res, painting, 'Approval revoked');
  } catch (err) { next(err); }
};

export const bulkApprovePaintings = async (req, res, next) => {
  try {
    const { schoolId } = req.params;
    const result = await prisma.painting.updateMany({
      where: { student: { school_id: parseInt(schoolId) }, is_approved: false },
      data: { is_approved: true, approved_at: new Date() }
    });
    return successResponse(res, { count: result.count }, `${result.count} paintings approved`);
  } catch (err) { next(err); }
};

// ─── Verification System ──────────────────────────────────────────────────────

export const getVerificationData = async (req, res, next) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        students: {
          include: {
            attendance: true,
            painting: true,
            result: true,
          }
        }
      },
      orderBy: { school_name: 'asc' }
    });

    const verificationData = schools.map(school => {
      const total = school.students.length;
      const present = school.students.filter(s => s.attendance?.is_present).length;
      const submitted = school.students.filter(s => s.painting).length;
      const presentNoSubmission = school.students.filter(
        s => s.attendance?.is_present && !s.painting
      ).length;

      const allApproved = school.students
        .filter(s => s.painting)
        .every(s => s.painting.is_approved);

      return {
        school_id: school.id,
        school_name: school.school_name,
        state: school.state,
        registered: total,
        present,
        submissions: submitted,
        present_no_submission: presentNoSubmission,
        all_approved: submitted > 0 && allApproved,
        results_published: school.students.some(s => s.result?.published),
      };
    });

    return successResponse(res, verificationData);
  } catch (err) { next(err); }
};

// ─── Results ──────────────────────────────────────────────────────────────────

export const publishResults = async (req, res, next) => {
  try {
    const { schoolId } = req.params;

    // Get approved paintings with scores
    const paintings = await prisma.painting.findMany({
      where: {
        student: { school_id: parseInt(schoolId) },
        is_approved: true
      },
      include: {
        student: true,
        scores: true,
      }
    });

    if (paintings.length === 0)
      return errorResponse(res, 'No approved paintings to rank');

    // Calculate average score per painting
    const scored = paintings
      .filter(p => p.scores.length > 0)
      .map(p => ({
        studentId: p.student_id,
        score: p.scores.reduce((sum, s) => sum + s.total_score, 0) / p.scores.length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Transaction: delete old results, insert new
    await prisma.$transaction(async (tx) => {
      await tx.result.deleteMany({ where: { school_id: parseInt(schoolId) } });

      for (let i = 0; i < scored.length; i++) {
        await tx.result.create({
          data: {
            school_id: parseInt(schoolId),
            student_id: scored[i].studentId,
            rank: i + 1,
            score: scored[i].score,
            published: true,
          }
        });
      }
    });

    return successResponse(res, null, 'Results published successfully');
  } catch (err) { next(err); }
};

export const undoPublishResults = async (req, res, next) => {
  try {
    const { schoolId } = req.params;
    await prisma.result.updateMany({
      where: { school_id: parseInt(schoolId) },
      data: { published: false }
    });
    return successResponse(res, null, 'Results unpublished');
  } catch (err) { next(err); }
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const getLeaderboard = async (req, res, next) => {
  try {
    const results = await prisma.result.findMany({
      where: { published: true },
      include: {
        student: { select: { full_name: true, class: true, unique_student_id: true } },
        school: { select: { school_name: true, state: true } }
      },
      orderBy: [{ school_id: 'asc' }, { rank: 'asc' }]
    });
    return successResponse(res, results);
  } catch (err) { next(err); }
};

// ─── Export CSV ───────────────────────────────────────────────────────────────

export const exportSchoolsCSV = async (req, res, next) => {
  try {
    const schools = await prisma.school.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { school_name: 'asc' }
    });

    const header = 'School Name,Teacher,Email,City,State,Students,Profile Complete\n';
    const rows = schools.map(s =>
      `"${s.school_name}","${s.teacher_name}","${s.email}","${s.city || ''}","${s.state || ''}",${s._count.students},${s.profile_completed}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="schools.csv"');
    res.send(header + rows);
  } catch (err) { next(err); }
};

// ─── Judge Management ─────────────────────────────────────────────────────────

export const createJudge = async (req, res, next) => {
  try {
    const data = createJudgeSchema.parse(req.body);
    const existing = await prisma.judge.findUnique({ where: { email: data.email } });
    if (existing) return errorResponse(res, 'Judge email already exists', 409);

    const password_hash = await bcrypt.hash(data.password, 12);
    const judge = await prisma.judge.create({
      data: { name: data.name, email: data.email, password_hash },
      select: { id: true, name: true, email: true, created_at: true }
    });
    return successResponse(res, judge, 'Judge created successfully', 201);
  } catch (err) { next(err); }
};