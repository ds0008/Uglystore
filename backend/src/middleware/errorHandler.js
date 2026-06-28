const AppError = require("../utils/AppError");

const normalizePrismaError = (err) => {
  if (!err || !err.code) return null;

  switch (err.code) {
    case "P2002": {
      const fields = err.meta?.target;
      const fieldList = Array.isArray(fields) ? fields.join(", ") : "field";
      return AppError.conflict(`A record with that ${fieldList} already exists`);
    }
    case "P2025":
      return AppError.notFound(
        err.meta?.cause || "The requested record was not found",
      );
    case "P2003": {
      const field = err.meta?.field_name || "reference";
      return AppError.badRequest(
        `Invalid ${field}: the referenced record does not exist`,
      );
    }
    case "P2014":
      return AppError.conflict(
        "Cannot delete this record because it is referenced by other records",
      );
    default:
      return null;
  }
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const prismaError = normalizePrismaError(err);
  const error = prismaError || err;

  const statusCode = error.statusCode || 500;
  const isOperational = error instanceof AppError && error.isOperational;
  const isProduction = process.env.NODE_ENV === "production";

  if (statusCode >= 500) {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`,
      err,
    );
  }

  const message =
    isProduction && !isOperational && statusCode >= 500
      ? "Internal Server Error"
      : error.message || "Internal Server Error";

  const response = {
    success: false,
    message,
  };

  if (!isProduction && statusCode >= 500) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
