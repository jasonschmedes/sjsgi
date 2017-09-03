require('should')
const sinon = require('sinon')
const Response = require('../../../lib/app/cgi/Response')

describe('app/cgi', function() {
  describe('Response', function() {

    let res
    let write

    beforeEach(function() {
      res = new Response()
      write = sinon.spy(process.stdout, 'write')
    })

    describe('#sendHeaders', function() {
      it('should send the headers to stdout', function() {
        res.header('Hello', 'World')
        res.header('Status', 500)
        res.sendHeaders()
        write.getCall(0).args[0].should.equal('Hello: World\nStatus: 500\n\n')
      })

      it('should not send headers more than once', function() {
        res.header('Hello', 'World')
        res.sendHeaders()
        res.sendHeaders()
        write.calledOnce.should.be.true()
      })

      it('should add the status header if it does not exist', function() {
        res.sendHeaders()
        write.getCall(0).args[0].should.equal('Status: 200 OK\n\n')
      })
    })

    describe('#respondWith', function() {
      it('should send the headers and content to stdout', function() {
        res.header('Status', '200 OK')
        res.respondWith('Hello World\n')
        write.getCall(0).args[0].should.equal('Status: 200 OK\n\n')
        write.getCall(1).args[0].should.equal('Hello World\n')
      })
    })

    describe('#write', function() {
      it('should send a string to stdout', function() {
        Response.write('Hello World\n')
        write.getCall(0).args[0].should.equal('Hello World\n')
      })
    })

    afterEach(function() {
      write.restore()
    })

  })
})
