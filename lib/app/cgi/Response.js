let headers = {}
let headersSent = false

class Response {
  static header(name, value) {
    headers[name] = value
  }

  static sendHeaders() {
    if ( ! headersSent) {
      let content = ''
      if ( ! headers['Status']) {
        headers['Status'] = '200 OK'
      }
      for (let h in headers) {
        content += `${h}: ${headers[h]}\n`
      }
      Response.write(content + '\n')
      headersSent = true
    }
  }

  static respondWith(content, next) {
    Response.sendHeaders()
    Response.write(content, next)
  }

  static write(str, next) {
    process.stdout.write(str, next)
  }
}

module.exports = Response
