const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('../errors/custom-api')
const errorHandlerMiddleware = (err, req, res, next) => {

  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something wnet wrong, try again later'
  }

  // if (err instanceof CustomAPIError) {
  //   return res.status(err.statusCode).json({ msg: err.message })
  // }

  if(err.name === 'ValidationError') {
    customError.statusCode = 400;
    customError.msg = Object.values(err.errors)
      .map(item => item.message)
      .join(',')
  }

  if(err.name === 'CastError') {
    customError.statusCode = 404;
    customError.msg = `No item found with id: ${err.value}`
  }

  if(err.code && err.code === 11000) {
    customError.statusCode = 400;
    customError.message = `Duplicated value entered for ${Object.keys(err.keyValue)} field, please choose another value`
  }

  //return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err })
  return res.status(customError.statusCode).json({ msg: customError.msg  })

}

module.exports = errorHandlerMiddleware
