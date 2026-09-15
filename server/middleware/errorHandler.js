const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server error occurred';

  // Multer File Upload Errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size is too large. Maximum allowed size is 25 MB.';
  } else if (err.message && err.message.startsWith('INVALID_FILE_TYPE')) {
    statusCode = 400;
    message = 'Invalid file format. Only PDF (.pdf) documents are allowed.';
  }

  console.error(`[Express Error] ${req.method} ${req.originalUrl}:`, message);
  
  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
