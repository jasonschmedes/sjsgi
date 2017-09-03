require('should')
const HeaderList = require('../../../lib/util/http/HeaderList')
const Header = require('../../../lib/util/http/Header')

describe('util/http/', function() {
  describe('HeaderList', function() {

    let headers
    beforeEach(function() {
      headers = new HeaderList()
    })

    describe('#constructor', function() {
      it('should initialize the list array and names object', function() {
        headers.list.should.be.an.Array().with.length(0)
        JSON.stringify(headers.names).should.equal('{}')
      })
    })

    describe('#add', function() {

      it('should take one or more arguments', function() {
        let contentType = new Header('Content-Type', 'text/plain')
        let status = new Header('Status', 200)
        let index = new Header('X-Index', 2)
        headers.add(
          contentType,
          status
        )
        headers.add(index)
        headers.list[0].should.equal(contentType)
        headers.list[1].should.equal(status)
        headers.list[2].should.equal(index)
      })

      it('should store headers in an ordered list', function() {
        let status = new Header('Status', 200)
        let index = new Header('X-Index', '1')
        let contentType = new Header('Content-Type', 'text/plain')
        headers.add(
          status,
          index,
          contentType
        )
        headers.list[0].should.equal(status)
        headers.list[1].should.equal(index)
        headers.list[2].should.equal(contentType)
      })

      it('should store duplicates of headers', function() {
        let cookie1 = new Header('Set-Cookie', 'cookie1')
        let cookie2 = new Header('Set-Cookie', 'cookie2')
        headers.add(
          cookie1,
          cookie2
        )
        headers.list[0].name.should.equal('Set-Cookie')
        headers.list[1].name.should.equal('Set-Cookie')
      })

      it('should store name -> index for lookups', function() {
        let index0 = new Header('X-Index', '0')
        let status = new Header('Status', 200)
        headers.add(
          index0,
          status
        )
        headers.names['X-Index'].should.equal(0)
        headers.names['Status'].should.equal(1)
      })

    })

    describe('#exists', function() {

      it('should return True for headers that exist.', function() {
        let index0 = new Header('X-Index', '0')
        let index1 = new Header('X-Index', '1')
        let index2 = new Header('X-Index', '2')
        let index3 = new Header('X-Index', '3')
        let status = new Header('Status', 200)
        headers.add(
          index0,
          index1,
          index2,
          index3,
          status
        )
        headers.exists('X-Index').should.be.True()
        headers.exists('Status').should.be.True()
      })

      it('should return False for unset headers.', function() {
        let index0 = new Header('X-Index', '0')
        let index1 = new Header('X-Index', '1')
        let index2 = new Header('X-Index', '2')
        let index3 = new Header('X-Index', '3')
        let status = new Header('Status', 200)
        headers.add(
          index0,
          index1,
          index2,
          index3,
          status
        )
        headers.exists('Content-Type').should.be.False()
        headers.exists('X-Proxy').should.be.False()
      })

    })

    describe('#toString', function() {
      it('should format the headers as an HTTP response', function() {
        let status = new Header('Status', 200)
        let index1 = new Header('X-Index', '1')
        let index2 = new Header('X-Index', '2')
        let index3 = new Header('X-Index', '3')
        let index4 = new Header('X-Index', '4')
        let contentType = new Header('Content-Type', 'text/plain')
        headers.add(
          status,
          index1,
          index2,
          index3,
          index4,
          contentType
        )
        headers.toString().should.equal(
          'Status: 200\n' +
          'X-Index: 1\n' +
          'X-Index: 2\n' +
          'X-Index: 3\n' +
          'X-Index: 4\n' +
          'Content-Type: text/plain\n' +
          '\n'
        )
      })
    })
  })
})
