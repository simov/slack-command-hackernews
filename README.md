

# slack-command-hackernews

[![npm-version]][npm] [![travis-ci]][travis] [![coveralls-status]][coveralls]

> HackerNews /slash Command for Slack

```js
var hackernews = require('slack-command-hackernews')
var express = require('express')
var parser = require('body-parser')

var config = {token: '[OAuth App Verification Token]'}

var server = express()
server.use(parser.urlencoded({extended: true}))
server.use(parser.json())

server.use('/hackernews', (req, res) => {
  res.json(hackernews.response(config, req.body))
  hackernews.query(config, req.body).catch(console.error)
})

server.listen(3000)
```

Option                | Value
:--                   | :--
Command               | `/hackernews`
Request URL           | `https://website.com/hackernews`
Short Description     | `Query HackerNews`
Usage Hing            | `[new|top|best] [count]`


Command               | Description
:--                   | :--
`/hackernews`         | the 5 newest stories
`/hackernews new 5`   | the 5 newest stories
`/hackernews top 3`   | the top 3 stories
`/hackernews best 10` | the 10 best stories
`/hackernews help`    | help message


  [npm-version]: https://img.shields.io/npm/v/slack-command-hackernews.svg?style=flat-square (NPM Package Version)
  [travis-ci]: https://img.shields.io/travis/simov/slack-command-hackernews/master.svg?style=flat-square (Build Status - Travis CI)
  [coveralls-status]: https://img.shields.io/coveralls/simov/slack-command-hackernews.svg?style=flat-square (Test Coverage - Coveralls)

  [npm]: https://www.npmjs.com/package/slack-command-hackernews
  [travis]: https://travis-ci.org/simov/slack-command-hackernews
  [coveralls]: https://coveralls.io/github/simov/slack-command-hackernews
