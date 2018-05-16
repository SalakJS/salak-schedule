const { Service } = require('salak')

class Test extends Service {
  static timer () {
    return {
      interval: 1000
    }
  }

  run () {
    this.service('hi').sayHi()

    this.logger.info('heihei: ' + process.pid)
  }
}

module.exports = Test
