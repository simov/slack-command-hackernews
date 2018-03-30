
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

var t = require('assert')
var fs = require('fs')
var path = require('path')
var https = require('https')
var express = require('express')
var parser = require('body-parser')
var hackernews = require('../')

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


describe('hackernews', () => {
  var server, callback

  before((done) => {
    var stream
    var app = express()

    app.use(parser.json())

    app.get(/^\/v0\/(new|best|top)stories\.json$/, (req, res) => {
      stream = req.params[0]
      res.json(fixtures.stories[req.params[0]])
    })
    app.get(/^\/v0\/item\/(\d+)\.json/, (req, res) => {
      res.json(
        fixtures.items[stream]
          .filter((item) => item.id === parseInt(req.params[0]))[0]
      )
    })
    app.post('/response', (req, res) => {
      callback(req.body)
      res.end()
    })
    server = https.createServer(credentials, app)
    server.listen(5000, done)
  })

  it('invalid token', () => {
    var config = {
      token: 'hey'
    }
    var input = {
      token: 'loot'
    }

    t.deepEqual(
      hackernews.response(config, input),
      {attachments: fixtures.command.invalid},
      'should respond with `invalid` attachment'
    )
  })

  it('help', () => {
    var config = {
      token: 'hey'
    }
    var input = {
      token: 'hey',
      text: 'help'
    }

    t.deepEqual(
      hackernews.response(config, input),
      {attachments: fixtures.command.help},
      'should respond with `help` attachment'
    )
  })

  it('new 5 - default', async () => {
    var config = {
      token: 'hey',
      origin: 'https://localhost:5000'
    }
    var input = {
      token: 'hey',
      text: 'new 5',
      response_url: 'https://localhost:5000/response'
    }

    t.deepEqual(
      hackernews.response(config, input),
      {attachments: fixtures.command.ok},
      'should respond with `ok` attachment'
    )

    callback = (body) => {
      t.deepEqual(body, {attachments: fixtures.attachments.new})
    }

    try {
      t.equal(
        await hackernews.query(config, input),
        undefined,
        'should resolve with undefined'
      )
    }
    catch (err) {
      throw err
    }
  })

  it('best 25', async () => {
    var config = {
      token: 'hey',
      origin: 'https://localhost:5000'
    }
    var input = {
      token: 'hey',
      text: 'best 25',
      response_url: 'https://localhost:5000/response'
    }

    t.deepEqual(
      hackernews.response(config, input),
      {attachments: fixtures.command.ok},
      'should respond with `ok` attachment'
    )

    callback = (body) => {
      t.deepEqual(body, {attachments: fixtures.attachments.best})
    }

    try {
      t.equal(
        await hackernews.query(config, input),
        undefined,
        'should resolve with undefined'
      )
    }
    catch (err) {
      throw err
    }
  })

  it('top 2', async () => {
    var config = {
      token: 'hey',
      origin: 'https://localhost:5000'
    }
    var input = {
      token: 'hey',
      text: 'top 2',
      response_url: 'https://localhost:5000/response'
    }

    t.deepEqual(
      hackernews.response(config, input),
      {attachments: fixtures.command.ok},
      'should respond with `ok` attachment'
    )

    callback = (body) => {
      t.deepEqual(body, {attachments: fixtures.attachments.top})
    }

    try {
      t.equal(
        await hackernews.query(config, input),
        undefined,
        'should resolve with undefined'
      )
    }
    catch (err) {
      throw err
    }
  })

  it('error', async () => {
    var config = {
      token: 'hey',
      origin: 'https://localhost:5000'
    }
    var input = {
      token: 'hey',
      text: 'top 3',
      response_url: 'https://localhost:5000/response'
    }

    t.deepEqual(
      hackernews.response(config, input),
      {attachments: fixtures.command.ok},
      'should respond with `ok` attachment'
    )

    callback = (body) => {
      t.deepEqual(body, {attachments: fixtures.command.error})
    }

    try {
      await hackernews.query(config, input)
      return Promise.reject(new Error('Should throw an error'))
    }
    catch (err) {
      t.equal(err.message, `Cannot read property 'replace' of undefined`)
    }
  })

  after((done) => {
    server.close(done)
  })
})
