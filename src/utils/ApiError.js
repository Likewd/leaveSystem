class ApiError extends Error {
    constructor(
        message = "Something went wrong",
        statusCode,
        // errors = [],
        // stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export { ApiError }