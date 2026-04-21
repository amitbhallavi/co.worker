const errorHandler = (err, req, res, next) => {
    const responseCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500)
    res.status(responseCode)
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
    })
}

export default errorHandler
