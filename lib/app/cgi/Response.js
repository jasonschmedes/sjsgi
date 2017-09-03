const HeaderList = require('../../util/http/HeaderList')
const Header = require('../../util/http/Header')

class Response {
  constructor() {
    this.headers = new HeaderList()
    this.headersSent = false
  }

  /**
   * Add a header to the response.
   *
   * Params:
   *   name (str): The name of the header.
   *   value (mixed): The value of the header.
   */
  header(name, value) {
    this.headers.add(new Header(name, value))
  }

  /**
   * Flush all of the headers that have been added to the response and prevent
   * them from being flushed again.
   *
   * Note: The status is set to 200 OK if no other status has been given.
   */
  sendHeaders() {
    if ( ! this.headersSent) {
      if ( ! this.headers.exists('Status')) {
        this.header('Status', '200 OK')
      }
      Response.write(this.headers.toString())
      this.headersSent = true
    }
  }

  /**
   * Send a response. This will flush the headers and prevent any more headers
   * from being sent.
   *
   * Params:
   *   content (str): The response body.
   *   next (callback): A function to call after the response has been written.
   */
  respondWith(content, next) {
    this.sendHeaders()
    Response.write(content, next)
  }

  /**
   * Write content out. This will not send the headers. Use `respondWith` for
   * HTTP responses so that the HTTP headers will be included.
   *
   * Params:
   *   str (str): The content to write out.
   *   next (callback): A function to call after writing is complete.
   */
  static write(str, next) {
    process.stdout.write(str, next)
  }
}

module.exports = Response
