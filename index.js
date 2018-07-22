module.exports = require('./lib/timer')
module.exports.stores = {
  memory: require('./lib/store/memory_store'),
  redis: require('./lib/store/redis_store')
}
