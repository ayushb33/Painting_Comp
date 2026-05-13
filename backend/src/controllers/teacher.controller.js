import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { studentSchema, csvStudentSchema } from '../validators/student.validator.js';
import { generateUniqueStudentId } from '../utils/generateStudentId.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';
import { z } from 'zod';

const prisma = new PrismaClient();

// ─── Students ─────────────────────────────────────────────────────────────────

export const addStudent = async (req, res, next) => {
  try {
    const schoolId = req.user.id;
    const data = studentSchema.parse(req.body);

    const duplicate = await prisma.student.findFirst({
      where: { admission_number: data.admission_number, school_id: schoolId }
    });
    if (duplicate) return errorResponse(res, 'Student with this admission number already exists', 409);

    const unique_student_id = await generateUniqueStudentId(schoolId);

    const student = await prisma.student.create({
      data: { ...data, school_id: schoolId, unique_student_id }
    });
    return successResponse(res, student, 'Student added successfully', 201);
  } catch (err) { next(err); }
};

export const bulkUploadStudents = async (req, res, next) => {
  try {
    const schoolId = req.user.id;
    if (!req.file) return errorResponse(res, 'CSV file required', 400);

    const csvContent = req.file.buffer.toString('utf-8');
    let records;
    try {
      records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
    } catch (e) {
      return errorResponse(res, 'Invalid CSV format', 400);
    }

    if (records.length === 0) return errorResponse(res, 'CSV is empty', 400);
    if (records.length > 500) return errorResponse(res, 'Max 500 students per upload', 400);

    // Normalize headers — supports both friendly names and snake_case
    const normalizedRecords = records.map(row => ({
      full_name:        row['Full Name']       || row['full_name']       || '',
      class:            row['Class']           || row['class']           || '',
      section:          row['Section']         || row['section']         || '',
      father_name:      row["Father's Name"]   || row['father_name']     || '',
      admission_number: row['Admission Number']|| row['admission_number']|| '',
    }));

    const results = { success: [], errors: [], duplicates: [] };

    // Validate all rows first
    const validStudents = [];
    for (let i = 0; i < normalizedRecords.length; i++) {
      const row = normalizedRecords[i];
      const parsed = csvStudentSchema.safeParse(row);
      if (!parsed.success) {
        results.errors.push({
          row: i + 2,
          issues: parsed.error.errors.map(e => e.message)
        });
        continue;
      }
      validStudents.push({ index: i + 2, data: parsed.data });
    }

    // Use transaction for bulk insert
    await prisma.$transaction(async (tx) => {
      for (const item of validStudents) {
        const existing = await tx.student.findFirst({
          where: {
            admission_number: item.data.admission_number,
            school_id: schoolId
          }
        });
        if (existing) {
          results.duplicates.push({
            row: item.index,
            admission_number: item.data.admission_number
          });
          continue;
        }
        const unique_student_id = await generateUniqueStudentId(schoolId);
        const student = await tx.student.create({
          data: { ...item.data, school_id: schoolId, unique_student_id }
        });
        results.success.push(student.unique_student_id);
      }
    });

    return successResponse(
      res,
      results,
      `Uploaded: ${results.success.length} students. Duplicates: ${results.duplicates.length}. Errors: ${results.errors.length}`
    );
  } catch (err) { next(err); }
};

export const getMyStudents = async (req, res, next) => {
  try {
    const schoolId = req.user.id;
    const { page = 1, limit = 50, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { school_id: schoolId };
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { unique_student_id: { contains: search, mode: 'insensitive' } },
        { admission_number: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where, skip, take: parseInt(limit),
        include: {
          attendance: true,
          painting: { select: { id: true, is_approved: true, image_url: true } },
        },
        orderBy: { full_name: 'asc' }
      }),
      prisma.student.count({ where })
    ]);

    return successResponse(res, {
      students,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) { next(err); }
};

// ─── Attendance ───────────────────────────────────────────────────────────────

export const markAttendance = async (req, res, next) => {
  try {
    const schoolId = req.user.id;
    const { attendanceData } = req.body; // [{ student_id, is_present }]

    if (!Array.isArray(attendanceData) || attendanceData.length === 0)
      return errorResponse(res, 'Attendance data required', 400);

    // Verify all students belong to this school
    const studentIds = attendanceData.map(a => a.student_id);
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds }, school_id: schoolId }
    });
    if (students.length !== studentIds.length)
      return errorResponse(res, 'Some students do not belong to your school', 403);

    await prisma.$transaction(
      attendanceData.map(({ student_id, is_present }) =>
        prisma.attendance.upsert({
          where: { student_id },
          update: { is_present },
          create: { student_id, is_present }
        })
      )
    );

    return successResponse(res, null, 'Attendance saved successfully');
  } catch (err) { next(err); }
};

// ─── Painting Upload ──────────────────────────────────────────────────────────

export const uploadPainting = async (req, res, next) => {
  try {
    const schoolId = req.user.id;
    const { student_id } = req.body;

    if (!req.file) return errorResponse(res, 'Image file required', 400);
    if (!student_id) return errorResponse(res, 'Student ID required', 400);

    const student = await prisma.student.findFirst({
      where: { id: parseInt(student_id), school_id: schoolId },
      include: { attendance: true, painting: true }
    });

    if (!student) return errorResponse(res, 'Student not found', 404);
    if (!student.attendance?.is_present)
      return errorResponse(res, 'Student must be marked present before uploading painting', 403);
    if (student.painting)
      return errorResponse(res, 'Painting already uploaded for this student', 409);

    // Upload buffer to Cloudinary
    const image_url = await uploadBufferToCloudinary(req.file.buffer);

    const painting = await prisma.painting.create({
      data: { student_id: parseInt(student_id), image_url }
    });

    return successResponse(res, painting, 'Painting uploaded successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getProfile = async (req, res, next) => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, school_name: true, teacher_name: true, email: true,
        contact_number: true, city: true, state: true, profile_completed: true
      }
    });
    if (!school) return errorResponse(res, 'School not found', 404);
    return successResponse(res, school);
  } catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updateSchema = z.object({
      contact_number: z.string().min(10).max(15).optional(),
      city: z.string().min(2).optional(),
      state: z.string().min(2).optional(),
    });
    const data = updateSchema.parse(req.body);

    const isComplete = !!(data.contact_number && data.city && data.state);
    const school = await prisma.school.update({
      where: { id: req.user.id },
      data: { ...data, profile_completed: isComplete },
      select: {
        id: true, school_name: true, teacher_name: true, email: true,
        contact_number: true, city: true, state: true, profile_completed: true
      }
    });
    return successResponse(res, school, 'Profile updated');
  } catch (err) { next(err); }
};

// ─── Results ──────────────────────────────────────────────────────────────────

export const getMyResults = async (req, res, next) => {
  try {
    const schoolId = req.user.id;
    const results = await prisma.result.findMany({
      where: { school_id: schoolId, published: true },
      include: {
        student: { select: { full_name: true, class: true, section: true, unique_student_id: true } }
      },
      orderBy: { rank: 'asc' }
    });

    if (results.length === 0)
      return successResponse(res, { published: false, message: 'Results will be announced soon' });

    return successResponse(res, { published: true, results });
  } catch (err) { next(err); }
};

// ─── CSV Template ─────────────────────────────────────────────────────────────

export const downloadCSVTemplate = (req, res) => {
  const template = `full_name,class,section,father_name,admission_number
John Doe,10,A,Robert Doe,ADM001
Jane Smith,9,B,Michael Smith,ADM002`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="student_template.csv"');
  res.send(template);
};

export const deleteStudent = async (req, res, next) => {
  try {
    const schoolId = req.user.id;
    const { studentId } = req.params;

    // Verify student belongs to this school
    const student = await prisma.student.findFirst({
      where: { id: parseInt(studentId), school_id: schoolId },
      include: { painting: true }
    });

    if (!student) return errorResponse(res, 'Student not found', 404);

    // Block deletion if painting is already approved
    if (student.painting?.is_approved)
      return errorResponse(res, 'Cannot remove student whose painting has been approved', 403);

    // Cascade deletes attendance and painting automatically (set in schema)
    await prisma.student.delete({ where: { id: parseInt(studentId) } });

    return successResponse(res, null, 'Student removed successfully');
  } catch (err) { next(err); }
};