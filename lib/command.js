
var https = require('https')

var compose = require('request-compose')
var request = compose.client

var client = require('./client')
var params = require('./params')
var attachment = require('./attachment')


var respond = ({auth, input}) => ({
  attachments:
    input.token !== auth.token ? attachment.error('Invalid token!') :
    input.text === 'help' ? attachment.help() :
    attachment.ok()
})

var execute = async ({auth, input, config}) => {
  if (auth.token !== input.token || input.text === 'help') {
    return
  }

  var agent = new https.Agent({keepAlive: true, maxSockets: 2})

  try {
    await client(Object.assign({auth, input, config, agent}, params(input.text)))
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

module.exports = {respond, execute}
