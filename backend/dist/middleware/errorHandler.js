"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
function errorHandler(err, req, res, next) {
    console.error('❌ Error:', err.message);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: message,
        });
        return;
    }
    // Mongoose cast error (bad ObjectId)
    if (err.name === 'CastError') {
        res.status(400).json({
            success: false,
            error: 'Invalid ID format',
        });
        return;
    }
    res.status(statusCode).json({
        success: false,
        error: message,
    });
}
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
}
//# sourceMappingURL=errorHandler.js.map