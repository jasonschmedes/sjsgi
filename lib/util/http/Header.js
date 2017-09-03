class Header {
  constructor(name, value) {
    this.name = name
    this.value = value
  }

  /**
   * Format the header as a string.
   *
   * Returns:
   *   (str): The header in the format "name: value".
   */
  toString() {
    return `${this.name}: ${this.value}`
  }
}

module.exports = Header
