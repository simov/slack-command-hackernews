
const env = process.env.NODE_ENV || 'development'

var https = require('https')

var request = require('@request/client')
var purest = require('purest')({request})
var hackernews = purest({
  provider: 'hackernews', config: require('../config/purest')})


var attachment = {
  ok: () => ([{
    fallback: 'Slash Command Error!',
    pretext: '> working ...',
    mrkdwn_in: ['pretext']
  }]),

  help: () => ([{
    fallback: 'Slash Command Error!',
    text: [
      '`/hackernews` or `/hackernews new 5` - shows the 5 newest stories',
      '`/hackernews top 3` - shows the top 3 stories',
      '`/hackernews best 10` - shows the 10 best stories'
    ].join('\n\n'),
    mrkdwn_in: ['text']
  }]),

  error: (message) => ([{
    fallback: 'Slash Command Error!',
    color: 'danger',
    pretext: '> ' + message,
    mrkdwn_in: ['pretext']
  }]),

  item: (item) => ({
    fallback: 'Slash Command Error!',
    color: '#ff6600',

    author_name: item.by,
    author_link: 'https://news.ycombinator.com/user?id=' + item.by,
    author_icon: 'https://news.ycombinator.com/y18.gif',

    title: item.title || (item.text && item.text.slice(0, 25)),
    title_link: item.url,

    text: (item.text ? (item.text + '\n' ) : '') +
      '<https://news.ycombinator.com/item?id=' + item.id +
      '|' + (item.descendants || 0) + ' comments>',

    footer: item.type.replace(/^(\w){1}/, item.type[0].toUpperCase()) +
      ' (' + (item.score || 0) + ' points)',
    ts: item.time,

    mrkdwn_in: ['text']
  })
}

var async = {
  series: (news, done) => {
    var data = []
    var agent = new https.Agent({keepAlive: true, maxSockets: 1})

    var each = (index) => {
      if (index === news.length) {
        done(null, data)
        return
      }
      hackernews
        .get('item/' + news[index])
        .options({agent})
        .request((err, res, body) => {
          if (err) {
            done(err)
            return
          }
          if (body) {
            data.push(body)
          }
          each(++index)
        })
    }

    each(0)
  },

  parallel: (news, done) => {
    var data, error, count = 0
    var agent = new https.Agent({keepAlive: true, maxSockets: 2})

    var callback = (index) => (err, res, body) => {
      if (error) {
        return
      }
      if (err) {
        error = err
        done(err)
        return
      }
      if (body) {
        data[index] = body
      }
      if (++count === news.length) {
        done(null, data.filter((item) => (item)))
      }
    }

    var data = news.map((id, index) => {
      hackernews
        .get('item/' + id)
        .options({agent})
        .request(callback(index))
    })
  }
}


function query (stream, limit, done) {
  hackernews
    .get(stream + 'stories')
    .request((err, res, body) => {
      if (err) {
        done(err)
        return
      }

      var news = body.slice(0, limit)

      async.parallel(news, (err, data) => {
        if (err) {
          done(err)
          return
        }
        done(null, data.map(attachment.item))
      })
    })
}

function params (input) {
  var stream = 'new'
  var limit = 5

  if (!input) {
    return {stream, limit}
  }

  var params = input.split(' ')

  if (params[0] && /top|best|new/.test(params[0])) {
    stream = params[0]
  }

  if (params[1]) {
    var num = parseInt(params[1])
    if (num && num <= 10) {
      limit = num
    }
  }

  return {stream, limit}
}

function log (data, message, err) {
  console[err ? 'error' : 'log'](
    new Date().toString(),
    message,
    data.token,
    data.team_id,
    data.team_domain,
    data.channel_id,
    data.channel_name,
    data.user_id,
    data.user_name,
    data.command,
    data.text,
    data.response_url
  )
}


module.exports = (config) => (req, done) => {
  if (req.body.token !== config.token) {
    log(req.body, 'Invalid token!', true)
    done(null, attachment.error('Invalid token!'))
  }
  else if (req.body.text === 'help') {
    log(req.body, 'he')
    done(null, attachment.help())
  }
  else {
    log(req.body, 'wo')
    done(null, attachment.ok())

    var {stream, limit} = params(req.body.text)

    query(stream, limit, (err, attachments) => {
      if (err) {
        log(req.body, err.message, true)
        done(null, attachment.error(err.message))
        return
      }
      request({
        method: 'POST',
        url: req.body.response_url,
        json: {attachments},
        timeout: 3000,
        callback: (err, res, body) => {
          if (err) {
            log(req.body, err.message, true)
            done(null, attachment.error(err.message))
            return
          }
          log(req.body, body)
        }
      })
    })
  }
}
