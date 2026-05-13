export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ success: false, message: 'File too large. Max 5MB allowed.' });

  // Prisma unique constraint errors
  if (err.code === 'P2002')
    return res.status(409).json({ success: false, message: `Duplicate entry on field: ${err.meta?.target?.join(', ')}` });

  // Prisma not found errors
  if (err.code === 'P2025')
    return res.status(404).json({ success: false, message: 'Record not found' });

  // Zod validation errors
  if (err.name === 'ZodError')
    return res.status(422).json({ success: false, message: 'Validation failed', errors: err.errors });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};