const bluebird = require('bluebird')
const levelup = require('level')
const sublevel = require('level-sublevel')
let db

const levelPromise = (sublevel) => {
  ;['put', 'get', 'del', 'batch'].forEach((method) => {
    sublevel[method] = bluebird.promisify(sublevel[method])
  })
  return sublevel
}

const backingStore = {
  sublevel: function (name) {
    return levelPromise(db.sublevel(name))
  },
  init: function (dir) {
    db = sublevel(levelup(dir, { valueEncoding: 'json' }))
  },
  provide: function (sublevelReturningFn) {  // if you need to provide a different implementation than the one reliant on levelDB/sublevel
    backingStore.sublevel = sublevelReturningFn
  }
}

module.exports = backingStore
