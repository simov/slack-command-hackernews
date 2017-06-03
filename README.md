

# slack-command-hackernews

[![npm-version]][npm] [![travis-ci]][travis] [![coveralls-status]][coveralls] [![codecov-status]][codecov]

The HackerNews Slash Command for Slack can be used as [Standalone Server][standalone-server] or as a [Middleware][middleware] in any HTTP Server Framework.


# Table of Contents

- **[OAuth App][oauth-app]**
- **[Standalone Server][standalone-server]**
- **[API][api]**
- **[Middleware][middleware]**


# OAuth App

Add a Slash Command to your OAuth app and configure it like this:

- **Command:** `/hackernews`
- **Request URL:** `https://something.com/hackernews`
- **Short Description:** `Query HackerNews`
- **Usage Hing:** `[new|top|best] [count]`

There is one additional argument available:

```
/hackernews help
```

And the result is:

> `/hackernews` or `/hackernews new 5` displays the 5 newest stories

> `/hackernews top 3` displays the top 3 stories

> `/hackernews best 10` displays the 10 best stories


# Standalone Server

```bash
npm install -g slack-command-hackernews
```

```bash
slack-command-hackernews \
  --config /path/to/config.json \
  --port 3000 \
  --env production
```

### config.json

```json
{
  "development": {
    "token": "[Verification Token of your OAuth App]"
  },
  "production": {
    "token": "[Verification Token of your OAuth App]"
  }
}
```

# API

```js
var Hackernews = require('slack-command-hackernews')
var config = {token: '[Verification Token of your OAuth App]'}
var hackernews = Hackernews(config)

hackernews(input, log)
  .then((attachments) => {})
```

The `HackerNews` constructor accepts a `config` object that should contain the verification token of your OAuth app.

Then the `hackernews` instance is called with the `input` request body object that slack sends when a user triggers the command.

The `log` argument should be a function that logs to your server. You can pass an empty function `() => {}` to suppress logging, pass `console.log` to log everything to stdout, or implement your own wrapper function. For example all error messages are `instanceof Error` so you can log those to stderr `console.error` if you want.

Lastly the returned `attachments` argument is array of Slack attachments ready to be sent. If error occurs that is in some way related to the user an error attachment will be generated, all other errors are logged out using the `log` function.


# Middleware

This module can be embedded into existing HTTP server. Here is an example on how to use it in Express:

```js
var Hackernews = require('slack-command-hackernews')
var express = require('express')
var parser = require('body-parser')

var config = {token: '[Verification Token of your OAuth App]'}
var hackernews = Hackernews(config)

var server = express()
server.use(parser.urlencoded({extended: true}))
server.use(parser.json())

server.use('/hackernews', (req, res) => {
  hackernews(req.body, console.log)
    .then((attachments) => {
      res.json({attachments})
    })
})

server.listen(3000)
```

It's important to note that the module **catches all errors** and either returns the appropriate error message as attachment back to the user in Slack, and/or logs it out to the server.


  [npm-version]: https://img.shields.io/npm/v/slack-command-hackernews.svg?style=flat-square (NPM Package Version)
  [travis-ci]: https://img.shields.io/travis/simov/slack-command-hackernews/master.svg?style=flat-square (Build Status - Travis CI)
  [coveralls-status]: https://img.shields.io/coveralls/simov/slack-command-hackernews.svg?style=flat-square (Test Coverage - Coveralls)

  [npm]: https://www.npmjs.com/package/slack-command-hackernews
  [travis]: https://travis-ci.org/simov/slack-command-hackernews
  [coveralls]: https://coveralls.io/github/simov/slack-command-hackernews

  [oauth-app]: #oauth-app
  [standalone-server]: #standalone-server
  [api]: #api
  [middleware]: #middleware
