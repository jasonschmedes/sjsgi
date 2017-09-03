const Sails = require('sails').constructor
const CGIError = require('./cgi/Error')
const Request = require('./cgi/Request')
const Response = require('./cgi/Response')
const Input = require('../util/Input')

// Use the default CGIError configuration.
if ( ! CGIError.config) {
  CGIError.init()
}

class GI {

  /**
   * Load and execute a Sails application through CGI.
   *
   * Params:
   *   config (obj): The configuration to pass to Sails.
   *   app (Sails): The Sails application to load. Defaults to local app.
   *   env (obj): The CGI environment to use. Defaults to process.env.
   */
  static sails(config, app, env) {
    if ( ! app) {
      app = new Sails()
    }
    if ( ! env) {
      env = process.env
    }
    app.load(Object.assign({}, config), function(error) {
      if (error) {
        throw new CGIError('Failed to load app. ' + error)
        return null
      }
      GI.request(app, env, new Input())
    })
  }

  /**
   * Read the request into the Sails application.
   *
   * Params:
   *   app (Sails): The Sails application to send the request to.
   *   env (obj): The CGI environment to use.
   *   stdin (Input): The Input to read from.
   */
  static request(app, env, stdin) {
    let cgiReq = new Request()
    stdin = stdin ? stdin : new Input()
    cgiReq.init(env)
    stdin.read(function(error, data) {
      if (error) {
        throw new CGIError('Cannot read the request data from stdin.')
      }
      app.request({
        url: cgiReq.getMeta('request_uri'),
        method: cgiReq.getMeta('request_method'),
        headers: cgiReq.getHeaders(),
        data: Request.parseContent(data, cgiReq.getMeta('content_type'))
      }, function(error, response) {
        if (error) {
          GI.respond({
            statusCode: error.status,
            headers: {},
            body: error.body
          }, app)
        }
        else {
          GI.respond(response, app)
        }
      })
    })
  }

  /**
   * Respond with the response from the Sails application.
   *
   * Params:
   *   res (obj): The response object from Sails.
   *   app (Sails): The Sails application to lower.
   *   cgiRes (Response): Response instance to use for responding.
   */
  static respond(res, app, cgiRes) {
    let lower = function() {
      GI.lower(app)
    }
    cgiRes = cgiRes ? cgiRes : new Response()
    cgiRes.header('Status', res.statusCode)
    for (let h in res.headers) {
      cgiRes.header(h, res.headers[h])
    }
    try {
      cgiRes.respondWith(res.body, lower)
    }
    catch (e) {
      cgiRes.respondWith(JSON.stringify(res.body), lower)
    }
  }

  /**
   * Lower the Sails application.
   *
   * Params:
   *   app (Sails): The Sails application to lower.
   */
  static lower(app) {
    app.lower(function(error) {
      if (error) {
        throw new CGIError('Could not lower app.' + error)
      }
    })
  }

}

module.exports = GI
