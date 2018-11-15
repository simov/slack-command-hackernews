
var https = require('https')
var compose = require('request-compose')
var request = compose.client
var params = require('./lib/params')
var attachment = require('./lib/attachment')


var respond = ({auth, input}) => ({
  attachments:
    input.token !== auth.token ? attachment.error('Invalid token!') :
    input.text === 'help' ? attachment.help() :
    attachment.ok()
})


var _query = ({auth, input, config = {}, agent, stream, limit}) => compose(
  _ => request({
    url: (config.origin || 'https://hacker-news.firebaseio.com') +
      `/v0/${stream}stories.json`,
  }),

  ({body}) => Promise.all(
    body.slice(0, limit).map((id) =>
      request({
        url: (config.origin || 'https://hacker-news.firebaseio.com') +
          `/v0/item/${id}.json`,
        agent,
      })
    )
  ),

  items => items
    .map(({body}) => body)
    .map(attachment.item),

  attachments => request({
    method: 'POST',
    url: input.response_url,
    json: {attachments},
  })

)()


var query = async ({auth, input, config}) => {
  if (auth.token !== input.token || input.text === 'help') {
    return
  }

  var agent = new https.Agent({keepAlive: true, maxSockets: 2})

  try {
    await _query(Object.assign({auth, input, config, agent}, params(input.text)))
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


var mw = (auth) => (req, res) => {
  res.json(respond({auth, input: req.body}))
  query({auth, input: req.body})
    .catch(console.error)
}


module.exports = Object.assign(mw, {respond, query})
