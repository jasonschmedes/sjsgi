let headers = {}
let metas = {}

class Request {
  static getHeaders() {
    return headers
  }

  static getheader(name) {
    return headers[name.toLowerCase()]
  }

  static setHeader(name, value) {
    headers[name.toLowerCase()] = value
  }

  static getMetas() {
    return metas
  }

  static getMeta(name) {
    return metas[name.toLowerCase()]
  }

  static setMeta(name, value) {
    metas[name.toLowerCase()] = value
  }

  static parseContent(content, type = null) {
    let parsed
    if ( ! type) {
      type = Request.getMeta('content_type')
    }
    switch (type) {
      case 'application/json':
        parsed = JSON.parse(content)
        break
      case 'application/x-www-form-urlencoded':
        parsed = require('querystring').parse(content)
        break
      default:
        parsed = String(content)
    }
    return parsed
  }

  static init() {
    for (let key in process.env) {
      let name = key.toLowerCase()
      name.indexOf('http_') === 0 ?
        Request.setHeader(name.substring(5), process.env[key]) :
        Request.setMeta(name, process.env[key])
    }
  }
}

Request.init()

module.exports = Request
