require('should')
const Header = require('../../../lib/util/http/Header')

describe('util/http/', function() {
  describe('Header', function() {

    describe('#constructor', function() {
      it('should store the name and value parameters', function() {
        let h = new Header('Status', 200)
        h.name.should.equal('Status')
        h.value.should.equal(200)
      })
    })

    describe('#toString', function() {
      it('should format the header as "name: value"', function() {
        let h = new Header('Status', 200)
        h.toString().should.equal('Status: 200')
      })
    })

  })
})
