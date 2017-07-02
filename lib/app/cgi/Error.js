let Response = require('./Response')

process.on('uncaughtException', function(error) {
  let message = `<br/>
    <div style="color: red">
      <strong>EXCEPTION</strong>: ${error.message}
      <i><pre>${error.stack}</pre></i>
    </div>`
  Response.header('Status', '500 CGI Error')
  Response.respondWith(message + '\n')
})

class CGIError extends Error {
  constructor(message) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = CGIError
