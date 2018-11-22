

# slack-command-hackernews

[![npm-version]][npm] [![travis-ci]][travis] [![coveralls-status]][coveralls]

> HackerNews /slash Command for Slack

## middleware

```js
var express = require('express')
var hackernews = require('slack-command-hackernews')
var auth = {token: 'hook token'}

express()
  .use(hackernews(auth))
  .listen(3000)
```

## api

```js
var express = require('express')
var parser = require('body-parser')
var hackernews = require('slack-command-hackernews')
var auth = {token: 'hook token'}

express()
  .use(parser.urlencoded({extended: true}))
  .use((req, res) => {
    var input = req.body
    res.json(hackernews.respond({auth, input}))
    hackernews.query({auth, input}).catch(console.error)
  })
  .listen(3000)
```

## command

Option                | Value
:--                   | :--
Command               | `/hackernews`
Request URL           | `https://website.com/hackernews`
Short Description     | `Query HackerNews`
Usage Hint            | `[new|top|best] [count]`

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
