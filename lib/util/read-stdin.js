module.exports = function(next) {
  let data = ''
  process.stdin.on('data', function(datum) {
    data += datum
  })

  process.stdin.on('end', function() {
    next(data)
  })
}
