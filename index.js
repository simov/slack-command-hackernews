
var https = require('https')
var compose = require('request-compose')
var request = compose.client
var params = require('./lib/params')
var attachment = require('./lib/attachment')


module.exports = {
  response: (config, input) => ({
    attachments:
      input.token !== config.token ? attachment.error('Invalid token!') :
      input.text === 'help' ? attachment.help() :
      attachment.ok()
  }),
  query: async (config, input) => {
    if (config.token !== input.token || input.text === 'help') {
      return
    }

    var {stream, limit} = params(input.text)

    var agent = new https.Agent({keepAlive: true, maxSockets: 2})

    try {
      await compose(
        () => request({
          url: `${config.origin || 'https://hacker-news.firebaseio.com'}/v0/${stream}stories.json`,
        }),
        ({body}) => Promise.all(
          body.slice(0, limit).map((id) =>
            request({
              url: `${config.origin || 'https://hacker-news.firebaseio.com'}/v0/item/${id}.json`,
              agent,
            })
          )
        ),
        (results) => results
          .map(({body}) => body)
          .map(attachment.item),
        (attachments) => request({
          method: 'POST',
          url: input.response_url,
          json: {attachments},
        })
      )()
    }
    catch (err) {
      request({
        method: 'POST',
        url: input.response_url,
        json: {attachments: attachment.error('Internal error!')}
      })
      throw err
    }
    finally {
      agent.destroy()
    }
  }
}
