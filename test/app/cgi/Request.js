require('should')
const Request = require('../../../lib/app/cgi/Request')

describe('app/cgi', function() {
  describe('Request', function() {

    let req

    beforeEach(function() {
      req = new Request()
    })

    describe('#parseContent', function() {
      it('should return an empty object for empty content', function() {
        let parsed = Request.parseContent()
        JSON.stringify(parsed).should.equal('{}')
      })

      it('should parse JSON content', function() {
        let parsed = Request.parseContent('{"json": true}', 'application/json')
        parsed.should.be.an.Object()
        parsed.json.should.be.true()
      })

      it('should ignore case when determining content-type', function() {
        let parsed = Request.parseContent('{"json": true}', 'aPplicAtion/JSON')
        parsed.should.be.an.Object()
        parsed['json'].should.be.true()
      })

      it('should parse URL encoded form content', function() {
        let parsed = Request.parseContent(
          'urlencoded=true',
          'application/x-www-form-urlencoded'
        )
        parsed['urlencoded'].should.equal('true')
      })

      it('should default to the raw data', function() {
        let parsed = Request.parseContent('urlencoded=true')
        parsed.should.equal('urlencoded=true')
      })
    })

    describe('#constructor', function() {
      it('should set headers and metas properties to an object', function() {
        JSON.stringify(req.headers).should.equal('{}')
        JSON.stringify(req.metas).should.equal('{}')
      })
    })

    describe('#getHeaders', function() {
      it('should retrieve all of the headers', function() {
        req.setHeader('hello', 'world')
        let headers = req.getHeaders()
        headers.should.be.an.Object()
        headers['hello'].should.equal('world')
      })
    })

    describe('#getHeader', function() {
      it('should retrieve a header value by name', function() {
        req.setHeader('hello', 'world')
        req.getHeader('hello').should.equal('world')
      })

      it('should use lowercase keys to lookup values', function() {
        req.setHeader('hello', 'world')
        req.getHeader('HeLlO').should.equal('world')
      })
    })

    describe('#setHeader', function() {
      it('should save a key/value pair in the list of headers', function() {
        req.setHeader('hello', 'world')
        req.getHeader('hello').should.equal('world')
      })

      it('should make keys lowercase', function() {
        req.setHeader('HeLlO', 'world')
        req.getHeader('hello').should.equal('world')
      })
    })

    describe('#getMetas', function() {
      it('should retrieve all of the metas', function() {
        req.setMeta('hello', 'world')
        let metas = req.getMetas()
        metas.should.be.an.Object()
        metas['hello'].should.equal('world')
      })
    })

    describe('#getMeta', function() {
      it('should retrieve a meta value by name', function() {
        req.setMeta('hello', 'world')
        req.getMeta('hello').should.equal('world')
      })

      it('should use lowercase keys to lookup values', function() {
        req.setMeta('hello', 'world')
        req.getMeta('HeLlO').should.equal('world')
      })
    })

    describe('#setMeta', function() {
      it('should save a key/value pair in the list of headers', function() {
        req.setMeta('hello', 'world')
        req.getMeta('hello').should.equal('world')
      })

      it('should make keys lowercase', function() {
        req.setMeta('HeLlO', 'world')
        req.getMeta('hello').should.equal('world')
      })
    })

    describe('#init', function() {
      let env = {
        'HTTP_UPPERCASE': 'HTTP_UPPERCASE',
        'http_lowercase': 'http_lowercase',
        'META_UPPERCASE': 'META_UPPERCASE',
        'meta_lowercase': 'meta_lowercase'
      }

      beforeEach(function() {
        req.init(env)
      })

      it('should initialize HTTP headers from env', function() {
        let headers = req.getHeaders()
        headers['lowercase'].should.equal('http_lowercase')
      })

      it('should ignore case for HTTP header keys', function() {
        let headers = req.getHeaders()
        headers['uppercase'].should.equal('HTTP_UPPERCASE')
      })

      it('should initialize HTTP meta variables from env', function() {
        let metas = req.getMetas()
        metas['meta_uppercase'].should.equal('META_UPPERCASE')
      })

    })

    afterEach(function() {
      delete req
    })

  })
})
