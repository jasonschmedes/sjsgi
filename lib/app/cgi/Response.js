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

  static respondWith(content) {
    Response.sendHeaders()
    Response.write(content)
  }

  static write(str) {
    process.stdout.write(str)
  }
}

module.exports = Response
