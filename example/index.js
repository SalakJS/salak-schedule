const Salak = require('salak')
const http = require('http')
const Redis = require('redis')

const app = new Salak({
  opts: {
    root: 'application'
  }
})

const schedule = require('..')

app.redis = Redis.createClient({
  host: '127.0.0.1',
  port: 6379
})

if (!app.createAnonymousContext) {
  app.createAnonymousContext = () => {
    const request = {
      headers: {
        'x-forwarded-for': '127.0.0.1'
      },
      query: {},
      querystring: '',
      host: '127.0.0.1',
      hostname: '127.0.0.1',
      protocol: 'http',
      secure: 'false',
      method: 'GET',
      url: '/',
      path: '/',
      socket: {
        remoteAddress: '127.0.0.1',
        remotePort: 7001
      }
    }

    const response = new http.ServerResponse(request)
    return app.createContext(request, response)
  }
}

schedule({}, app)

setTimeout(() => {
  app.closeSchedules()
}, 10000)

app.on('ready', () => {
  app.listen(3000)
})
