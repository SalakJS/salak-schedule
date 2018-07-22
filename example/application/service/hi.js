const { Service } = require('salak')

class Hi extends Service {
  sayHi () {
    this.logger.info('say hi')
  }
}

module.exports = Hi
