const Timer = require('./lib/timer')

module.exports = (options = {}, app) => {
  if (options.enable === false) {
    return
  }

  const moduleSchedules = app.loader.loadDir(app.modules, 'schedule')
  const ctx = app.createAnonymousContext()

  const { prefix, Store } = options

  let needLocker = false

  for (let mod in moduleSchedules) {
    const schedules = moduleSchedules[mod]

    for (let key in schedules) {
      const Schedule = schedules[key]

      const timer = typeof Schedule['timer'] === 'function' ? Schedule['timer']() : {}

      if (timer.type && timer.type !== 'all') {
        needLocker = true
        break
      }
    }

    if (needLocker) {
      break
    }
  }

  const timerHandler = new Timer({
    app,
    prefix,
    needLocker,
    Store,
    options: options.options
  })

  app.on('ready', () => {
    for (let mod in moduleSchedules) {
      const schedules = moduleSchedules[mod]

      for (let key in schedules) {
        const Schedule = schedules[key]

        const timer = typeof Schedule['timer'] === 'function' ? Schedule['timer']() : {}

        if (timer.enable === false) {
          continue
        }

        const schedule = new Schedule(ctx, mod)
        timerHandler.handler(`${mod}.${key}`, timer, async () => {
          await schedule.run()
        })
      }
    }
  })

  app.getSchedules = () => {
    return timerHandler.getSchedules()
  }

  app.runSchedule = (key) => {
    timerHandler.runSchedule(key)
  }

  app.closeSchedules = () => {
    timerHandler.close()
  }
}
