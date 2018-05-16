const RedLock = require('redlock-node')

class RedisStore {
  constructor ({ client }) {
    this.redlock = new RedLock(client)
  }

  lock (key, ttl) {
    if (ttl <= 0) {
      ttl = 5
    }

    return this.redlock.lock(key, ttl)
  }

  unlock (lock) {
    this.redlock.unlock(lock)
  }
}

module.exports = RedisStore
