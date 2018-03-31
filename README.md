

# slack-command-hackernews

[![npm-version]][npm] [![travis-ci]][travis] [![coveralls-status]][coveralls]

> HackerNews /slash Command for Slack

## server

```js
var express = require('express')
var parser = require('body-parser')

var hackernews = require('slack-command-hackernews')
var path = require('path')
var auth = require(path.resolve(process.cwd(), process.argv[2]))


express()
  .use(parser.urlencoded({extended: true}))
  .use(parser.json())
  .use('/hackernews', (req, res) => {
    var input = req.body
    res.json(hackernews.respond({auth, input}))
    hackernews.query({auth, input}).catch(console.error)
  })
  .listen(3000)
```

## auth

```json
{
  "token": "hook token"
}
```

## script

```bash
node server.js ~/path/to/auth.json
```

## command

Option                | Value
:--                   | :--
Command               | `/hackernews`
Request URL           | `https://website.com/hackernews`
Short Description     | `Query HackerNews`
Usage Hing            | `[new|top|best] [count]`

## example

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
