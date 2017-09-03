class HeaderList {
  constructor() {
    this.list = []
    this.names = {}
  }

  /**
   * Add a header to the list.
   *
   * Params:
   *   header (Header): The HTTP header to add to the list.
   */
  add(header) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this.add(arguments[i])
      }
    }
    else {
      this.list.push(header)
      this.names[header.name] = this.list.length - 1 // name: index in list
    }
  }

  /**
   * Check that a particular header is in the list.
   *
   * Params:
   *   name (str): The HTTP header to check exists.
   *
   * Returns:
   *   (bool): True if the header is in the list, false otherwise.
   */
  exists(name) {
    return this.names[name] !== undefined
  }

  /**
   * Format the HeaderList as an HTTP response string.
   *
   * Returns:
   *   (str): Each header separated by newlines in the format "name: value".
   */
  toString() {
    let str = ''
    for (let i = 0; i < this.list.length; i++) {
      str += this.list[i].toString() + '\n'
    }
    return str + '\n'
  }

}

module.exports = HeaderList
