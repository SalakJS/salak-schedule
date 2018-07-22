const Salak = require('salak')
const Redis = require('redis')

// @TODO fix this
const app = new Salak({
  opts: {
    root: 'application'
  }
})

app.redis = Redis.createClient({
  host: '127.0.0.1',
  port: 6379
})

app.listen(3000)
