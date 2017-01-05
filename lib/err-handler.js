module.exports = function* (next) {
  try {
    yield next
  } catch (err) {
    if (err.isBoom) {
      this.status = err.output.statusCode
      this.body = err.output.payload
    } else if (err.isJoi) {
      this.status = 400
      this.body = {
        statusCode: 400,
        error: err
      }
    } else {
      const statusCode = err.statusCode || err.status || 500
      this.status = statusCode
      this.body = {
        error: err.name,
        message: err.message,
        statusCode: statusCode
      }
    }
    this.app.emit('error', err, this)
  }
}
