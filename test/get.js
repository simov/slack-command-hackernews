
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

var t = require('assert')
var fs = require('fs')
var path = require('path')
var https = require('https')
var request = require('@request/client')
var purest = require('purest')({request, promise: Promise})
var express = require('express')
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
  }
}

var hackernews = purest({
  provider: 'hackernews',
  config: {
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
})

describe('get', () => {
  var server

  before((done) => {
    var stream
    var app = express()
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
    server = https.createServer(credentials, app)
    server.listen(3000, done)
  })

  it('new 5 default', (done) => {
    command
      .get(hackernews, 'new', 5)
      .then((attachments) => {
        t.deepEqual(attachments, fixtures.attachments.new)
        done()
      })
      .catch((err) => done(err))
  })

  it('best 25', (done) => {
    command
      .get(hackernews, 'best', 5)
      .then((attachments) => {
        t.deepEqual(attachments, fixtures.attachments.best)
        done()
      })
      .catch((err) => done(err))
  })

  it('top 2', (done) => {
    command
      .get(hackernews, 'top', 2)
      .then((attachments) => {
        t.deepEqual(attachments, fixtures.attachments.top)
        done()
      })
      .catch((err) => done(err))
  })

  after((done) => {
    server.close(done)
  })
})
