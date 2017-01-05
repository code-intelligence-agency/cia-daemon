const path = require('path')
module.exports = {
  run: (run) => {
    const runDate = new Date()
    return path.basename(run.localPath) + '::' + runDate.toJSON()
  },
  event: (event) => {
    return `${event.run}::${event.ordinal}::${event.file}:${event.location}`
  }
}
