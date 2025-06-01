const { log } = require('../util/helper')
const { NODE_ENV } = require('../config')

const errorLogger = async (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    log(err.name, err.message)

    // Operational errors are known errors (e.g., validation, not found)
    // Programming errors are bugs in the code
    if (NODE_ENV === 'production') {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }

        // For non-operational errors in production, send a generic message
        // Log the error
        log('PROGRAMMING OR UNKNOWN ERROR :', err);
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }

    // In development, send detailed error information
    return res.status(err.statusCode).json({
        status: err.status,
        error: { ...err, name: err.name },
        message: err.message,
        stack: err.stack,
    });
}

const notFound = (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    err.status = 'fail';
    err.statusCode = 404;
    err.isOperational = true; // This is an operational error
    next(err);
}

module.exports = { errorLogger, notFound };