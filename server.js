// require('instabot')
global.Promise = require('bluebird')
const app = require('koa')()
app.use(require('./lib/err-handler'))
const router = require('koa-router')()
const boom = require('boom')
const os = require('os')
const homeDir = os.homedir()
const parse = require('co-body')
const store = require('./lib/sublevel-wrapper')
const mkdirp = require('mkdirp')
const path = require('path')
const dbPath = path.join(homeDir, '.cia', 'db')
mkdirp.sync(dbPath)

store.init(dbPath)
const runs = store.sublevel('run')
const events = store.sublevel('event')
const keys = require('./lib/keys')
runs.createReadStream({
  // lt: '/home/capaj/git_projects/CIA/babel-cia::2016-12-30T16:04:19'
}).on('data', ({key, value}) => {
  console.log({key, value})
  runs.del(key)
})

events.createReadStream().on('data', ({key, value}) => {
  console.log({key, value})
  events.del(key)
})


router.post('/run', function *() {
  const body = yield parse(this)
  if (!body.hostname) {
    body.hostname = os.hostname()
  }
  if (!body.localPath) {
    throw boom.badRequest('localPath is required property on payload')
  }
  const key = keys.run(body)
  yield runs.put(key, body)
  this.body = {
    key
  }
  this.status = 201
})

router.post('/:runId/event', function *() {
  const event = yield parse(this)
  const key = keys.event(event)

  yield events.put(key, event)
  this.body = {
    key
  }
  this.status = 201
})

app
  .use(router.routes())
  .use(router.allowedMethods())
app.listen(process.env.PORT || 5080)
