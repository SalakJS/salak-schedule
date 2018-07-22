# salak-schedule

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![David deps][david-image]][david-url]
[![NPM download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/salak-schedule.svg?style=flat-square
[npm-url]: https://npmjs.org/package/salak-schedule
[travis-image]: https://img.shields.io/travis/SalakJS/salak-schedule.svg?style=flat-square
[travis-url]: https://travis-ci.org/SalakJS/salak-schedule
[david-image]: https://img.shields.io/david/SalakJS/salak-schedule.svg?style=flat-square
[david-url]: https://david-dm.org/SalakJS/salak-schedule
[download-image]: https://img.shields.io/npm/dm/salak-schedule.svg?style=flat-square
[download-url]: https://npmjs.org/package/salak-schedule

Cron task for salak.

## Feature

- Three mode: single、worker and all. 
  - `single` means the task will be trigger on the only one thread in the only one machine. 
  - `worker` means the task will be trigger on the only one thread in every machine. 
  - `all` means the task will be trigger on every thread
- Task can trigger service.

## Install

```
npm install --save salak-schedule
```

## Usage

```javascript
const SalakSchedule = require('salak-schedule')

const timerHandler = new SalakSchedule({
  app: this.app,
  prefix,
  store: new SalakSchedule.stores['memory']()
})
```

load schedule from dir `schedule` under every module.

```javascript
const { Service } = require('salak')

class Task extends Service {
  static timer () {
    return {
      enable: true, // default true
      interval: 1000,
      type: 'all', // single、all、worker, default 'all'
      cron: '* * * * * *', // use `cron-parser`
      cronOptions: {}
    }
  }

  async run () { // for the task logic

  }
}
```

## API

### schedule options

- Store: for `single` or `worker`，default redisStore
- prefix: for `single` or `worker`，default 'salakTimer'
- options: options for Store. default app.redis

Timer

### getSchedules()

### runSchedule(key)

- key: `${module}.${taskfilename}`

### closeSchedules()

## Write a store

```javascript
class AStore {
  lock (key, ttl) {}
  unlock (lock) {}
}

module.exports = AStore
```

## License

MIT
