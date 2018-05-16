const ms = require('ms')
const ip = require('ip')
const parser = require('cron-parser')
const assert = require('assert')

const ipaddress = ip.address()

class Timer {
  constructor ({
    app,
    prefix = 'salakTimer',
    needLocker,
    Store,
    options
  } = {}) {
    this.logger = app.logger
    this.prefix = prefix
    this.intervals = new Map()
    this.timeouts = new Map()
    this.resources = {}

    if (needLocker) {
      if (!Store) { // 默认采用Redis
        Store = require('./redisStore')
        options = Object.assign({
          client: app.redis
        }, options)

        assert(options.client, 'redis locker must provide redis client')
      }
      this.locker = new Store(options)
    } else {
      this.locker = {
        lock: () => {
          this.logger.warn('You must provide locker when type is worker or single.')
        },
        unlock () {}
      }
    }
  }

  close () {
    for (const id of this.intervals.values()) {
      clearInterval(id)
    }
    this.intervals.clear()

    for (const id of this.timeouts.values()) {
      clearTimeout(id)
    }
    this.timeouts.clear()
  }

  async triggerListener (key, listener, ttl = 1, type = 'all') {
    if (['all', 'worker', 'single'].indexOf(type) === -1) {
      this.logger.warn(`Unsupported timer type: ${type}`)
    }

    if (type === 'all') {
      await listener()
      return
    }

    // 单个, single
    let lockKey = key

    if (type === 'worker') { // 单进程
      lockKey = `${key}_${ipaddress}`
    }

    let locker
    let now = Date.now()
    try {
      locker = await this.locker.lock(lockKey, ttl)
    } catch (err) {}

    if (!locker) {
      return
    }

    try {
      await listener()
    } catch (err) {
      this.logger.error(err)
    }

    // 释放锁
    let duration = Date.now() - now
    let halfTtl = (ttl / 2) * 1000

    if (duration > halfTtl) {
      this.locker.unlock(locker)
      return
    }

    setTimeout(() => {
      this.locker.unlock(locker)
    }, halfTtl - duration)
  }

  handler (key, schedule = {}, listener) {
    const scheduleKey = `${this.prefix}-${key}`
    const { cron, interval, cronOptions, type, immediate } = schedule

    let ttl

    if (interval) {
      const millsecond = this.parseInterval(interval)
      if (millsecond) {
        const tid = this.interval(async () => {
          ttl = Math.floor(millsecond / 1000)
          await this.triggerListener(scheduleKey, listener, ttl, type)
        }, millsecond)
        this.intervals.set(key, tid)
      } else {
        this.logger.error(new Error(`format interval ${interval} return undefined`))
      }
    } else if (cron) {
      let interval
      try {
        interval = parser.parseExpression(cron, cronOptions)
      } catch (err) {
        this.logger.error(new Error(`format cron ${cron} error: ${err.message}`))
      }

      if (interval) {
        ttl = Math.floor((interval.next().getTime() - interval.prev().getTime()) / 1000)

        this.startCron(key, interval, async () => {
          await this.triggerListener(scheduleKey, listener, ttl, type)
        })
      }
    }

    if (immediate) {
      this.triggerListener(scheduleKey, listener, ttl, type)
    }

    this.resources[key] = {
      scheduleKey,
      listener,
      type,
      ttl
    }
  }

  runSchedule (key) {
    const resource = this.resources[key]

    if (resource) {
      const { scheduleKey, listener, type, ttl } = resource

      this.triggerListener(scheduleKey, listener, ttl, type)
    }
  }

  getSchedules () {
    return this.resources
  }

  parseInterval (t) {
    if (typeof t === 'number') {
      return t
    }

    return ms(t)
  }

  startCron (key, interval, listener) {
    const now = Date.now()
    let nextInterval
    let nextTick

    try {
      do {
        nextInterval = interval.next()
        nextTick = nextInterval.getTime()
      } while (now >= nextTick)
    } catch (err) {
      const msg = `${key} reach endDate, will stop.`
      this.logger.warn(msg)
      return
    }

    const tid = this.timeout(() => {
      listener()
      this.startCron(key, interval, listener)
    }, nextTick - now)

    this.timeouts.set(key, tid)
  }

  timeout (handler, millsecond) {
    return setTimeout(handler, millsecond)
  }

  interval (handler, millsecond) {
    return setInterval(handler, millsecond)
  }
}

module.exports = Timer
