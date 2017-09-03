require('should')
let sinon = require('sinon')

const CGIError = require('../../../lib/app/cgi/Error')
const Response = require('../../../lib/app/cgi/Response')

describe('app/cgi', function() {
  describe('Error', function() {

    let error
    let res
    let level = 0
    let message = 'error.message'
    let safeMessage = 'CGIError.config.safeMessage'
    let status = 'CGIError.config.status'

    beforeEach(function() {
      res = new Response()
      CGIError.init({
        level,
        safeMessage,
        status,
        res
      })
      error = new CGIError(message)

      sinon.spy(process, 'on')
      sinon.spy(process, 'removeListener')

      sinon.spy(res, 'header')
      sinon.stub(res, 'respondWith')
    })

    it('should extend an Error', function() {
      error.should.be.instanceof(Error)
      error.message.should.equal(message)
    })

    describe('#level', function() {

      it('should handle uncaughtException with its handler', function() {
        CGIError.level(1)
        process.on.getCall(0).args[1].should.equal(CGIError.handler)
        CGIError.level(2)
        process.on.getCall(1).args[1].should.equal(CGIError.handler)
        CGIError.level(3)
        process.on.getCall(2).args[1].should.equal(CGIError.handler)
      })

      it('should use handler0 if no handler exists for the level', function() {
        CGIError.level(104) // CGIError.handler104() doesn't exist
        CGIError.handler.should.equal(CGIError.handler0)
      })

      describe('0', function() {
        it('should not listen for uncaughtException when turned off', function() {
          CGIError.level(0)
          process.removeListener.calledWith('uncaughtException', CGIError.handler).should.be.true()
        })

        it('should not do anything in its handler', function() {
          CGIError.level(0)
          CGIError.handler(error)

          res.respondWith.called.should.be.false()
        })
      })

      describe('1', function() {
        it('should listen for uncaughtException', function() {
          CGIError.level(1)
          process.on.getCall(0).args[0].should.equal('uncaughtException')
        })

        it('should respond with a safe, front-facing error message', function() {
          CGIError.level(1)
          CGIError.handler(error)

          res.respondWith.getCall(0).args[0].should.containEql(safeMessage)
          res.respondWith.getCall(0).args[0].should.not.containEql(error.stack)
        })
      })

      describe('2', function() {
        it('should listen for uncaughtException', function() {
          CGIError.level(2)
          process.on.getCall(0).args[0].should.equal('uncaughtException')
        })

        it('should respond with the real error message', function() {
          CGIError.level(2)
          CGIError.handler(error)

          res.respondWith.getCall(0).args[0].should.containEql(message)
          res.respondWith.getCall(0).args[0].should.not.containEql(error.stack)
        })
      })

      describe('3', function() {
        it('should listen for uncaughtException', function() {
          CGIError.level(3)
          process.on.getCall(0).args[0].should.equal('uncaughtException')
        })

        it('should respond with the stack', function() {
          CGIError.level(3)
          CGIError.handler(error)

          res.respondWith.getCall(0).args[0].should.containEql(error.stack)
        })
      })

    })

    describe('#handler', function() {

      it('should set the Status header with config value', function() {
        CGIError.level(1)
        CGIError.handler(error)
        res.header.calledWith('Status', status).should.be.true()
      })

    })

    afterEach(function() {
      process.on.restore()
      process.removeListener.restore()

      res.header.restore()
      res.respondWith.restore()
    })

  })
})
