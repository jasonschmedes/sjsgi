class Input {
  /**
   * Set the stream to use for input or default to stdin.
   *
   * Params:
   *   stream (Stream):
   */
  constructor(stream) {
    this.stream = stream ? stream : process.stdin
  }

  /**
   * Read from stream (stdin by default) until the end or an error occurs.
   *
   * Params:
   *   next (function): Callback to execute after reading stdin.
   *     error (boolean): True on error, false otherwise.
   *     data (string): String from stdin.
   */
  read(next) {
    let data = ''
    let stream = this.stream

    stream.on('data', function onData(datum) {
      try {
        data += String(datum)
      }
      catch(error) {
        stream.removeListener('data', onData)
        return next(true, error.message)
      }
    })

    stream.on('end', function onEnd() {
      // Success
      return next(false, data)
    })
  }
}

module.exports = Input
