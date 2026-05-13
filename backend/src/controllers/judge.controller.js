import { PrismaClient } from '@prisma/client';
import { scoreSchema } from '../validators/score.validator.js';
import { successResponse, errorResponse } from '../utils/response.js';

const prisma = new PrismaClient();

const calculateTotalScore = (r, c, t, p) =>
  (r / 5) * 30 + (c / 5) * 25 + (t / 5) * 25 + (p / 5) * 20;

export const getSchoolsForJudging = async (req, res, next) => {
  try {
    const judgeId = req.user.id;

    const schools = await prisma.school.findMany({
      where: {
        students: {
          some: {
            painting: { is_approved: true }
          }
        }
      },
      include: {
        _count: {
          select: {
            students: {
              where: { painting: { is_approved: true } }
            }
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    // Determine which schools have been fully judged
    const schoolStatuses = await Promise.all(schools.map(async (school) => {
      const approvedPaintings = await prisma.painting.count({
        where: { student: { school_id: school.id }, is_approved: true }
      });
      const scoredByJudge = await prisma.score.count({
        where: { judge_id: judgeId, painting: { student: { school_id: school.id } } }
      });
      return {
        school_id: school.id,
        school_name: school.school_name,
        state: school.state,
        total_paintings: approvedPaintings,
        scored_by_me: scoredByJudge,
        is_complete: scoredByJudge >= approvedPaintings && approvedPaintings > 0,
      };
    }));

    // Unlock logic: first school always unlocked, next unlocks when previous is complete
    let firstIncomplete = false;
    const withUnlock = schoolStatuses.map((s, i) => {
      const unlocked = i === 0 || schoolStatuses[i - 1].is_complete;
      return { ...s, unlocked };
    });

    return successResponse(res, withUnlock);
  } catch (err) { next(err); }
};

export const getPaintingsForSchool = async (req, res, next) => {
  try {
    const judgeId = req.user.id;
    const { schoolId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify school is unlocked for this judge
    const schoolIndex = await prisma.school.findMany({
      where: { students: { some: { painting: { is_approved: true } } } },
      orderBy: { id: 'asc' },
      select: { id: true }
    });

    const idx = schoolIndex.findIndex(s => s.id === parseInt(schoolId));
    if (idx > 0) {
      const prevSchoolId = schoolIndex[idx - 1].id;
      const prevApproved = await prisma.painting.count({
        where: { student: { school_id: prevSchoolId }, is_approved: true }
      });
      const prevScored = await prisma.score.count({
        where: { judge_id: judgeId, painting: { student: { school_id: prevSchoolId } } }
      });
      if (prevScored < prevApproved)
        return errorResponse(res, 'Complete the previous school before proceeding', 403);
    }

    const [paintings, total] = await Promise.all([
      prisma.painting.findMany({
        where: { student: { school_id: parseInt(schoolId) }, is_approved: true },
        skip, take: parseInt(limit),
        include: {
          scores: { where: { judge_id: judgeId }, select: { id: true, total_score: true } }
          // NOTE: Student identity intentionally hidden — no student info included
        }
      }),
      prisma.painting.count({
        where: { student: { school_id: parseInt(schoolId) }, is_approved: true }
      })
    ]);

    return successResponse(res, {
      paintings,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) { next(err); }
};

export const submitScore = async (req, res, next) => {
  try {
    const judgeId = req.user.id;
    const data = scoreSchema.parse(req.body);

    // Check painting exists and is approved
    const painting = await prisma.painting.findFirst({
      where: { id: data.painting_id, is_approved: true }
    });
    if (!painting) return errorResponse(res, 'Painting not found or not approved', 404);

    // Prevent re-scoring
    const existing = await prisma.score.findUnique({
      where: { painting_id_judge_id: { painting_id: data.painting_id, judge_id: judgeId } }
    });
    if (existing) return errorResponse(res, 'You have already scored this painting', 409);

    const total_score = calculateTotalScore(
      data.relevance_score, data.creativity_score,
      data.technique_score, data.presentation_score
    );

    const score = await prisma.score.create({
      data: {
        painting_id: data.painting_id,
        judge_id: judgeId,
        relevance_score: data.relevance_score,
        creativity_score: data.creativity_score,
        technique_score: data.technique_score,
        presentation_score: data.presentation_score,
        total_score,
      }
    });

    return successResponse(res, score, 'Score submitted successfully', 201);
  } catch (err) { next(err); }
};