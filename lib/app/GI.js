let Sails = require('sails').constructor

let Request = require('./cgi/Request')
let Response = require('./cgi/Response')
let CGIError = require('./cgi/Error')
let readStdin = require('../util/read-stdin')

let app

class GI {
  static sails(config = {}) {
    app = new Sails()
    app.load(config, function(error) {
      if (error) {
        throw new CGIError('Failed to load app. ' + error)
        return null
      }
      GI.request()
    })
  }

  static request() {
    readStdin(function(data) {
      app.request({
        url: Request.getMeta('request_uri'),
        method: Request.getMeta('request_method'),
        headers: Request.getHeaders(),
        data: Request.parseContent(data)
      }, function(error, response) {
        if (error) {
          GI.respond({
            statusCode: error.status,
            headers: {},
            body: error.body
          })  
        } 
        else {
          GI.respond(response)
        }
      })
    })
  }

  static respond(res) {
    Response.header('Status', res.statusCode)
    for (let h in res.headers) {
      Response.header(h, res.headers[h])
    }
    try {
      Response.respondWith(res.body, GI.lower)
    }
    catch (CGIError) {
      Response.respondWith(JSON.stringify(res.body), GI.lower)
    }
  }

  static lower() {
    app.lower(function(error) {
      if (error) {
        throw new CGIError('Could not lower app.' + error)
      }
    })
  }

}

module.exports = GI
