/**
 * Middleware to handle 404 Not Found errors.
 * This function is triggered when a request is made to a route that does not exist.
 */
const notFound = (req, res, next) => {
    // Create a new Error object with a descriptive message
    const error = new Error(`Not Found - ${req.originalUrl}`);
    // Set the HTTP status code to 404
    res.status(404);
    // Pass the error to the next middleware in the chain (the errorHandler)
    next(error);
};

/**
 * General error handling middleware.
 * This function catches all errors passed by `next(error)` from any route or other middleware.
 * It must have four arguments (err, req, res, next) for Express to recognize it as an error handler.
 */
const errorHandler = (err, req, res, next) => {
    // Determine the status code. If the status code is 200 (OK), it means an error occurred
    // in a successful route, so we default to 500 (Internal Server Error). Otherwise, use the existing status code.
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // Send a JSON response with the error message.
    // In a production environment, we hide the stack trace for security reasons.
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };
