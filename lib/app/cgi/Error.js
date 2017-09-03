/**
 * Configure CGI errors.
 *
 * Levels:
 *   - 0 - (Off) Do not catch exceptions.
 *   - 1 - (Production) Catch exceptions and output a friendly message.
 *   - 2 - (Testing) Catch exceptions and output the error message.
 *   - 3 - (Development) Catch exceptions and output the error and stack stylized in HTML.
 *
 * Config:
 *   - level (number) - The error level to set.
 *   - safeMessage (str) - The message to display when level is 1 (Production). Defaults to "There was a CGI Error"
 *   - status (str) - The status header to use. Defaults to "500 CGI Error".
 *
 * Custom Levels:
 *     Levels can be customized by continuing the naming scheme. Name a handler
 * in the form "handlerN" where N is the digit of the corresponding level.
 */
const Response = require('./Response')

class CGIError extends Error {

  constructor(message) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Configure CGI Errors.
   *
   * Params:
   *   config (obj): The configuration values.
   */
  static init(config) {
    CGIError.config = {
      level: 1,
      safeMessage: 'There was a CGI Error.',
      status: '500 CGI Error',
      res: new Response()
    }
    Object.assign(CGIError.config, config)
    CGIError.level(CGIError.config.level)
  }

  /**
   * The empty error handler for level 0.
   */
  static handler0() {
    return
  }

  /**
   * The error handler for level 1 and the default handler. It reports the
   * safe message when an error occurs.
   */
  static handler1() {
    let res = CGIError.config.res
    res.header('Status', CGIError.config.status)
    res.respondWith(CGIError.config.safeMessage)
  }

  /**
   * The error handler for level 2.
   *
   * Params:
   *   error (CGIError): The error containing the message to report.
   */
  static handler2(error) {
    let res = CGIError.config.res
    res.header('Status', CGIError.config.status)
    res.respondWith(error.message)
  }

  /**
   * The error handler for level 3.
   *
   * Params:
   *   error (CGIError): The error containing the message and stack to report.
   */
  static handler3(error) {
    let res = CGIError.config.res
    res.header('Status', CGIError.config.status)
    res.respondWith(`
      <div style="color: red">
        <strong>EXCEPTION</strong>: ${error.message}
        <em><pre>${error.stack}</pre></em>
      </div>\n`)
  }

  /**
   * Set the error handling level.
   *
   * Params:
   *   l (number): 0 - 3. The error level to use.
   */
  static level(l) {
    let handlerName = `handler${l}`

    if (CGIError.handler) {
      process.removeListener('uncaughtException', CGIError.handler)
    }
    if (CGIError[handlerName]) {
      CGIError.handler = CGIError[handlerName]
      process.on('uncaughtException', CGIError.handler)
    }
    else {
      CGIError.handler = CGIError.handler0
    }
  }
}

module.exports = CGIError
