const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    let statusCode = 500;
    let message = 'Internal Server Error';
    let errorCode = null;
    let details = null;

    if (err instanceof CustomError) {
        statusCode = err.statusCode;
        message = err.message;
        errorCode = err.errorCode;
        details = err.details;
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid user ID format';
    }

    res.status(statusCode).json({ message, errorCode, details });
};

class CustomError extends Error {
    constructor(message, statusCode, errorCode, details) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
    }
}

module.exports = {
    errorHandler,
    CustomError,
};