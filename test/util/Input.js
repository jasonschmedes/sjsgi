require('should')
const mockStdin = require('mock-stdin')
const Input = require('../../lib/util/Input')

describe('util', function() {
  describe('Input', function() {

    describe('#constructor', function() {
      it('should use the injected stream if one is given', function() {
        new Input(process.stdout).stream.should.equal(process.stdout)
      })
    })

    describe('#read', function() {

      let stdin
      let input

      beforeEach(function() {
        stdin = mockStdin.stdin()
        input = new Input()
      })

      it('should return data from stdin as a string', function(done) {
        input.read(function(error, data) {
          error.should.be.False()
          data.should.equal('Hello Test!\n')
          done()
        })
        stdin.send('Hello Test!\n')
        stdin.end()
      })

      it('should error gracefully on too much data', function(done) {
        let finished = false
        input.read(function(error) {
          error.should.be.True()
          finished = true
          done()
        })

        // Try to overwhelm stdin with data
        let longStr = getLongString()
        for (let i = 0; i < Math.pow(2, 27); i++) {
          stdin.send(longStr)
          if (finished) {
            break
          }
        }
        stdin.end()
      })

      afterEach(function() {
        stdin.restore()
      })
    })
  })
})

/**
 * Try getting really long strings until one works starting at 2^51 and
 * decrementing by factors of 2.
 *
 * Returns:
 *   (str): A string close to the maximum possible length of a string
 */
function getLongString() {
  let str
  for (let exp = 51; exp > 0; exp--) {
    try {
      str = 'x'.repeat(Math.pow(2, exp))
      return str
    }
    catch (error) {
      continue
    }
  }
}
