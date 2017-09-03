const CGIError = require('./Error')
class Request {

  constructor() {
    this.headers = {}
    this.metas = {}
  }

  /**
   * Parse an environment object for HTTP headers and meta data about the
   * CGI request. HTTP headers are the environment variables prepended with
   * 'http_'.
   *
   * Access parsed headers and meta data with the `getHeader` and `getMeta`
   * methods.
   *
   * Params:
   *   env (obj): Environment variables
   */
  init(env) {
    for (let key in env) {
      let name = key.toLowerCase()
      name.indexOf('http_') === 0 ?
        this.setHeader(name.substring(5), env[key]) :
        this.setMeta(name, env[key])
    }
  }

  /**
   * Get the headers object.
   *
   * Returns:
   *   (obj): The headers
   */
  getHeaders() {
    return this.headers
  }

  /**
   * Get a header from the headers object.
   *
   * Params:
   *   name (str): The name of the header to get. It is converted to lowercase.
   *
   * Returns:
   *   (obj): The value of the header.
   */
  getHeader(name) {
    return this.headers[name.toLowerCase()]
  }

  /**
   * Set a header.
   *
   * Params:
   *   name (str): The name of the header to set. It is converted to lowercase.
   *   value (mixed): The value to set the header to.
   */
  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value
  }

  /**
   * Get the metas object.
   *
   * Returns:
   *   (obj): The metas
   */
  getMetas() {
    return this.metas
  }

  /**
   * Get a meta from the metas object.
   *
   * Params:
   *   name (str): The name of the meta to get. It is converted to lowercase.
   *
   * Returns:
   *   (obj): The value of the meta.
   */
  getMeta(name) {
    return this.metas[name.toLowerCase()]
  }

  /**
   * Set a meta.
   *
   * Params:
   *   name (str): The name of the meta to set. It is converted to lowercase.
   *   value (mixed): The value to set the meta to.
   */
  setMeta(name, value) {
    this.metas[name.toLowerCase()] = value
  }

  /**
   * Parse encoded data into an object. If a type is not supported the data
   * is returned raw. Supported types are:
   *
   * application/json
   * application/x-www-form-urlencoded
   *
   * Params:
   *   content (str): The encoded content to decode.
   *   type (str): The content-type of the content.
   *
   * Returns:
   *   (obj): The decoded content
   */
  static parseContent(content, type) {
    let parsed
    if ( ! content) {
      return {}
    }
    if ( ! type) {
      type = ''
    }
    switch (type.toLowerCase()) {
      case 'application/json':
        try {
          parsed = JSON.parse(content)
        }
        catch(e) {
          throw new CGIError(JSON.stringify({
            error: "Invalid JSON data."
          }))
        }
        break
      case 'application/x-www-form-urlencoded':
        try {
          parsed = require('querystring').parse(content)
        }
        catch(e) {
          throw new CGIError('Invalid form-urlencoded data.')
        }
        break
      default:
        parsed = String(content)
    }
    return parsed
  }

}

module.exports = Request
