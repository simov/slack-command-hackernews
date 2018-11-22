
var compose = require('request-compose')
var attachment = require('./attachment')
var request = compose.client


module.exports = ({auth, input, config = {}, agent, stream, limit}) => compose(

  _ => request({
    url: (config.origin || 'https://hacker-news.firebaseio.com')
      + `/v0/${stream}stories.json`,
  }),

  ({body}) => Promise.all(
    body.slice(0, limit).map((id) =>
      request({
        url: (config.origin || 'https://hacker-news.firebaseio.com')
          + `/v0/item/${id}.json`,
        agent,
      })
    )
  ),

  (items) => items
    .map(({body}) => body)
    .map(attachment.item),

  (attachments) => request({
    method: 'POST',
    url: input.response_url,
    json: {attachments},
  })

)()
