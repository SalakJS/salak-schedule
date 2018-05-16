const { Service } = require('salak')

class Test extends Service {
  static timer () {
    return {
      cron: '*/2 * * * * *'
    }
  }

  run () {
    this.service('hi').sayHi()

    this.logger.info('heihei: ' + process.pid)
  }
}

module.exports = Test
