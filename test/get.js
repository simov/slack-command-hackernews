
var t = require('assert')
var http = require('http')
var request = require('@request/client')
var purest = require('purest')({request, promise: Promise})
var express = require('express')
var command = require('../')

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
      'http://localhost:3000': {
        '{endpoint}': {
          __path: {
            alias: '__default'
          }
        }
      }
    }
  }
})

var agent = new http.Agent({keepAlive: true, maxSockets: 2})


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
    server = app.listen(3000, done)
  })

  it('new 5 default', (done) => {
    command
      .get(hackernews, 'new', 5, agent)
      .then((attachments) => {
        t.deepEqual(attachments, fixtures.attachments.new)
        done()
      })
      .catch((err) => done(err))
  })

  it('best 25', (done) => {
    command
      .get(hackernews, 'best', 5, agent)
      .then((attachments) => {
        t.deepEqual(attachments, fixtures.attachments.best)
        done()
      })
      .catch((err) => done(err))
  })

  it('top 2', (done) => {
    command
      .get(hackernews, 'top', 2, agent)
      .then((attachments) => {
        t.deepEqual(attachments, fixtures.attachments.top)
        done()
      })
      .catch((err) => done(err))
  })

  after((done) => {
    agent.destroy()
    server.close(done)
  })
})
