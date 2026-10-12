export const errorHandler = (err, req, res, next) => {

    return res.status(err.statusCode).json({
        status: 'false',
        message: err.message || 'Something went wrong',
    });
}