
var https = require('https')
var request = require('@request/client')
var purest = require('purest')({request, promise: Promise})


var attachment = {
  ok: () => ([{
    fallback: 'HackerNews',
    pretext: '> working ...',
    mrkdwn_in: ['pretext']
  }]),

  help: () => ([{
    fallback: 'HackerNews',
    text: [
      '`/hackernews` or `/hackernews new 5` - shows the 5 newest stories',
      '`/hackernews top 3` - shows the top 3 stories',
      '`/hackernews best 10` - shows the 10 best stories'
    ].join('\n\n'),
    mrkdwn_in: ['text']
  }]),

  error: (message) => ([{
    fallback: 'HackerNews',
    color: 'danger',
    pretext: '> ' + message,
    mrkdwn_in: ['pretext']
  }]),

  item: (item) => ({
    fallback: 'HackerNews',
    color: '#ff6600',

    author_name: item.by,
    author_link: 'https://news.ycombinator.com/user?id=' + item.by,
    author_icon: 'https://news.ycombinator.com/y18.gif',

    title: item.title || (item.text && item.text.slice(0, 25)),
    title_link: item.url,

    text: (item.text ? (item.text + '\n') : '') +
      '<https://news.ycombinator.com/item?id=' + item.id +
      '|' + (item.descendants || 0) + ' comments>',

    footer: item.type.replace(/^(\w){1}/, item.type[0].toUpperCase()) +
      ' (' + (item.score || 0) + ' points)',
    ts: item.time,

    mrkdwn_in: ['text']
  })
}

var get = (hackernews, stream, limit) => hackernews
  .get(stream + 'stories')
  .request()
  .then(([res, body]) => ((
    news = body.slice(0, limit),
    agent = new https.Agent({keepAlive: true, maxSockets: 2})) =>
      Promise.all(news
        .map((id) => hackernews
          .get('item/' + id)
          .options({agent})
          .request()))
        .then((results) => (
          agent.destroy(),
          results
            .map(([res, body]) => body)
            .map(attachment.item))))())

var post = (url, attachments) => new Promise((resolve, reject) => {
  request({
    method: 'POST',
    url,
    json: {attachments},
    timeout: 3000,
    callback: (err, res, body) => err ? reject(err) : resolve(body)
  })
})

var params = (input) => {
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

var log = (input) => (message) => JSON.stringify({
  timestamp: new Date().getTime(),
  date: new Date().toString(),
  message,
  input
})

var command = (config) => ((
  hackernews = purest({
    provider: 'hackernews',
    config: config.purest || require('../config/purest')
  })) => (input) => new Promise((resolve) => {
    var message = log(input)

    if (input.token !== config.token) {
      console.error(message('Invalid token!'))
      resolve(attachment.error('Invalid token!'))
    }
    else if (input.text === 'help') {
      console.log(message('help'))
      resolve(attachment.help())
    }
    else {
      resolve(attachment.ok())

      var {stream, limit} = params(input.text)

      get(hackernews, stream, limit)
        .then((attachments) =>
          post(input.response_url, attachments)
            .then((body) => console.log(message(body))))
        .catch((err) => {
          console.error(message(err.message))
          post(input.response_url, attachment.error('Internal error!'))
            .then((body) => console.log(message(body)))
            .catch((err) => console.error(message(err.message)))
        })
    }
  }))()

module.exports = Object.assign(command, {attachment, get, post, params, log})
