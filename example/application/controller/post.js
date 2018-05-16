const { Controller } = require('salak')

class Post extends Controller {
  async actionIndex () {
    this.sendJson(0, 'ok')
  }
}

module.exports = Post
