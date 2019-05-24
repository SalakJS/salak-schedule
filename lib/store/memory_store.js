const ip = require('ip')

const ipaddress = ip.address()

class MemoryStore {
  constructor (options) {
    const {
      pm2,
      host = ipaddress
    } = Object.assign({
      pm2: 'INSTANCE_ID'
    }, options)

    this.pm2 = pm2
    this.host = host
    this.lockerStatus = new Map()
  }

  lock (key = '', ttl) {
    if (ttl <= 0) {
      ttl = 5
    }

    if (this.pm2 && process.env[this.pm2] !== '0') { // worker/single type
      throw new Error('cannot lock on none zero process.')
    }

    if (!key.endsWith(ipaddress)) { // single type
      if (this.host !== ipaddress) {
        throw new Error('cannot lock on this ip.')
      }
    }

    const value = this.lockerStatus.get(key)

    if (value) {
      throw new Error('lock is existed.')
    }

    this.lockerStatus.set(key, key)

    return new Promise((resolve, reject) => {
      resolve(() => {
        this.lockerStatus.delete(key)
      })
    })
  }

  unlock (releaseLock) {
    releaseLock && releaseLock()
  }
}

module.exports = MemoryStore
