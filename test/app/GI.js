require('should')
const mockStdin = require('mock-stdin')
const sinon = require('sinon')

const Response = require('../../lib/app/cgi/Response')


describe('app/', function() {
  describe('GI', function() {

    let GI

    beforeEach(function() {
      GI = require('../../lib/app/GI')
    })

    describe('#sails', function() {
      it('should load the app', function() {
        let app = {
          load: sinon.spy()
        }
        GI.request = sinon.stub()
        GI.sails({}, app)
        app.load.calledOnce.should.be.true()
      })

      it('should load the app with a given configuration', function() {
        let app = {
          load: sinon.spy()
        }
        let config = {
          globals: false
        }
        GI.request = sinon.stub()
        GI.sails(config, app)
        app.load.getCall(0).args[0].should.eql(config)
        app.load.getCall(0).args[0].should.not.equal(config)
      })

      it('should make a single request once the app is loaded', function() {
        let app = {
          load: sinon.spy()
        }
        let loadCallback
        GI.request = sinon.stub()
        GI.sails({}, app)
        loadCallback = app.load.getCall(0).args[1]
        loadCallback(false) // pretend there was no error
        GI.request.calledOnce.should.be.true()
        GI.request.getCall(0).args[0].should.equal(app)
      })

      it('should throw a CGIError if the app cannot load', function() {
        let app = {
          load: sinon.spy()
        }
        let loadCallback
        let cgiErrorTest = function() {
          // pretend there was an error
          loadCallback('A pretend error occurred.')
        }
        GI.request = sinon.stub()
        GI.sails({}, app)
        loadCallback = app.load.getCall(0).args[1]
        cgiErrorTest.should.throw()
        GI.request.called.should.be.false()
      })
    })

    describe('#request', function() {

      let stdin
      let env

      beforeEach(function() {
        env = {
          'request_uri': '/uri',
          'request_method': 'POST',
          'content_type': 'application/json',
          'http_accept': 'application/json'
        }

        stdin = mockStdin.stdin()
        sinon.stub(GI, 'respond')
      })

      it('should create a virtual request from the CGI request', function() {
        let app = {
          request: sinon.spy()
        }
        let requestObject

        GI.request(app, env)
        stdin.send(JSON.stringify({
          hello: 'world'
        }))
        stdin.end()

        app.request.calledOnce.should.be.true()

        requestObject = app.request.getCall(0).args[0]
        requestObject.url.should.equal(env.request_uri, 'Incorrect URL')
        requestObject.method.should.equal(env.request_method, 'Incorrect Method')
        requestObject.headers.should.have.value('accept', 'application/json')
        requestObject.data.should.have.value('hello', 'world')
      })

      it('should throw a CGIError if reading from stdin fails', function() {
        let stream = {
          read: sinon.spy()
        }
        let readCallback
        GI.request({}, {}, stream)
        readCallback = stream.read.getCall(0).args[1]
        let throwCgiError = function() {
          readCallback(true) // pretend there is an error
        }
        throwCgiError.should.throw()
      })

      it('should respond with an error if one occurs', function() {
        let app = {
          request: sinon.spy()
        }
        let pretendError = {
          status: 500,
          body: 'A pretend error occurred'
        }
        let requestCallback
        let respondObject

        GI.request(app, env)
        stdin.send(JSON.stringify({
          hello: 'world'
        }))
        stdin.end()

        requestCallback = app.request.getCall(0).args[1]
        requestCallback(pretendError) // pretend there was an error
        GI.respond.calledOnce.should.be.true()

        respondObject = GI.respond.getCall(0).args[0]
        respondObject.statusCode.should.equal(pretendError.status)
        respondObject.body.should.equal(pretendError.body)

        GI.respond.getCall(0).args[1].should.equal(app)
      })

      it('should respond with the sails response object', function() {
        let app = {
          request: sinon.spy()
        }
        let pretendResponse = {}
        let requestCallback
        let respondObject

        GI.request(app, env)
        stdin.send(JSON.stringify({
          hello: 'world'
        }))
        stdin.end()

        requestCallback = app.request.getCall(0).args[1]
        requestCallback(false, pretendResponse) // pretend there was no error
        GI.respond.calledOnce.should.be.true()

        respondObject = GI.respond.getCall(0).args[0]
        respondObject.should.equal(pretendResponse)

        GI.respond.getCall(0).args[1].should.equal(app)
      })

      afterEach(function() {
        stdin.restore()
        GI.respond.restore()
      })
    })

    describe('#respond', function() {

      let stdin
      let res
      let cgiRes
      let app

      beforeEach(function() {
        cgiRes = new Response()

        stdin = mockStdin.stdin()

        app = sinon.spy()
        res = {
          statusCode: 200,
          headers: {
            'Content-Type': 'text/plain'
          },
          body: 'Hello World!\n'
        }
        sinon.stub(GI, 'lower')
        sinon.stub(cgiRes, 'header')
        sinon.stub(cgiRes, 'respondWith')
      })

      it('should send the response headers', function() {
        GI.respond(res, app, cgiRes)
        let headerArgs1 = cgiRes.header.getCall(1).args
        headerArgs1[0].should.equal('Content-Type')
        headerArgs1[1].should.equal('text/plain')
      })

      it('should add the "Status" header if it does not exist', function() {
        GI.respond(res, app, cgiRes)
        let headerArgs0 = cgiRes.header.getCall(0).args
        headerArgs0[0].should.equal('Status')
        headerArgs0[1].should.equal(200)
      })

      it('should send the response body', function() {
        GI.respond(res, app, cgiRes)
        let respondWithArgs = cgiRes.respondWith.getCall(0).args
        respondWithArgs[0].should.equal(res.body)
      })

      it('should try to send the response body as a string', function() {
        cgiRes.respondWith.onCall(0).throws()
        GI.respond(res, app, cgiRes)
        let respondWithArgs = cgiRes.respondWith.getCall(1).args
        respondWithArgs[0].should.equal(JSON.stringify(res.body))
      })

      it('should lower the app once done responding', function() {
        GI.respond(res, app, cgiRes)

        // Pretend to finish responding
        cgiRes.respondWith.getCall(0).args[1]()
        GI.lower.calledOnce.should.be.true()
        GI.lower.getCall(0).args[0].should.equal(app)
      })

      afterEach(function() {
        stdin.restore()
        GI.lower.restore()
        cgiRes.header.restore()
        cgiRes.respondWith.restore()
      })
    })

    describe('#lower', function() {
      it('should lower the app', function() {
        let app = {
          lower: sinon.spy()
        }
        GI.lower(app)
        app.lower.calledOnce.should.be.true()
      })

      it('should throw a CGIError if the app cannot be lowered', function() {
        let app = {
          lower: sinon.spy()
        }
        let lowerCallback
        let cgiErrorTest = function() {
          // pretend there was an error
          lowerCallback('A pretend error occurred.')
        }
        GI.lower(app)
        lowerCallback = app.lower.getCall(0).args[0]
        cgiErrorTest.should.throw()
      })
    })

    afterEach(function() {
      delete require.cache[require.resolve('../../lib/app/GI')]
    })

  })
})
