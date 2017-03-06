
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

var t = require('assert')
var fs = require('fs')
var path = require('path')
var https = require('https')
var express = require('express')
var bodyParser = require('body-parser')
var command = require('../')

var credentials = {
  key: fs.readFileSync(path.resolve(__dirname, 'cert/private.pem'), 'utf8'),
  cert: fs.readFileSync(path.resolve(__dirname, 'cert/public.pem'), 'utf8')
}

var fixtures = {
  stories: {
    new: require('./fixtures/stories/new-5-default'),
    best: require('./fixtures/stories/best-25'),
    top: require('./fixtures/stories/top-2')
  },
  items: {
    new: require('./fixtures/items/new-5-default'),
    best: require('./fixtures/items/best-25'),
    top: require('./fixtures/items/top-2')
  },
  attachments: {
    new: require('./fixtures/attachments/new-5-default'),
    best: require('./fixtures/attachments/best-25'),
    top: require('./fixtures/attachments/top-2')
  },
  command: require('./fixtures/command')
}

var purest = {
  hackernews: {
    'https://localhost:3000': {
      '{endpoint}': {
        __path: {
          alias: '__default'
        }
      }
    }
  }
}


describe('command', () => {
  var server, callback

  before((done) => {
    var stream
    var app = express()
    app.use(bodyParser.json())
    app.get(/^\/(new|best|top)stories$/, (req, res) => {
      stream = req.params[0]
      res.json(fixtures.stories[req.params[0]])
    })
    app.get('/item/:id', (req, res) => {
      res.json(
        fixtures.items[stream]
        .filter((item) => item.id === parseInt(req.params.id))[0]
      )
    })
    app.post('/response', (req, res) => {
      res.end('ok')
      callback(req.body)
    })
    server = https.createServer(credentials, app)
    server.listen(3000, done)
  })

  it('invalid token', (done) => {
    command({token: 'hey'})({token: 'loot'})
      .then((attachment) => {
        t.deepEqual(attachment, fixtures.command.invalid)
        done()
      })
  })

  it('help', (done) => {
    command({token: ''})({token: '', text: 'help'})
      .then((attachment) => {
        t.deepEqual(attachment, fixtures.command.help)
        done()
      })
  })

  it('success', (done) => {
    command({token: '', purest})({token: '', text: 'top 2',
      response_url: 'https://localhost:3000/response'
    })
      .then((attachment) => {
        t.deepEqual(attachment, fixtures.command.ok)
        callback = (body) => {
          t.deepEqual(body, {attachments: fixtures.attachments.top})
          done()
        }
      })
  })

  it('error', (done) => {
    command({token: '', purest})({token: '', text: 'top 3',
      response_url: 'https://localhost:3000/response'
    })
      .then((attachment) => {
        t.deepEqual(attachment, fixtures.command.ok)
        callback = (body) => {
          t.deepEqual(body, {attachments: fixtures.command.error})
          done()
        }
      })
  })

  after((done) => {
    server.close(done)
  })
})
