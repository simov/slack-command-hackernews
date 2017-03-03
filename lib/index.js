
var https = require('https')
var request = require('@request/client')
var purest = require('purest')({request, promise: Promise})
var hackernews = purest({
  provider: 'hackernews', config: require('../config/purest')})


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

    text: (item.text ? (item.text + '\n' ) : '') +
      '<https://news.ycombinator.com/item?id=' + item.id +
      '|' + (item.descendants || 0) + ' comments>',

    footer: item.type.replace(/^(\w){1}/, item.type[0].toUpperCase()) +
      ' (' + (item.score || 0) + ' points)',
    ts: item.time,

    mrkdwn_in: ['text']
  })
}

var query = (stream, limit) => hackernews
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
        .then((results) => results
          .map(([res, body]) => body)
          .map(attachment.item)))())

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

var post = (input, attachments) => new Promise((resolve, reject) => {
  request({
    method: 'POST',
    url: input.response_url,
    json: {attachments},
    timeout: 3000,
    callback: (err, res, body) => err ? reject(err) : resolve(body)
  })
})

module.exports = (config) => (input) => new Promise((resolve) => {
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

    query(stream, limit)
      .then((attachments) =>
        post(input, attachments)
          .then((body) => console.log(message(body))))
      .catch((err) => console.error(message(err.message)))
  }
})
