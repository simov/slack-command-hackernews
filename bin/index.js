#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2))

if (argv.help) {
  console.log('--config path/to/config.json')
  console.log('--port number')
  console.log('--env environment')
  process.exit()
}

if (!argv.config) {
  console.error('Specify --config path/to/config.json')
  process.exit()
}

if (!argv.port) {
  console.error('Specify --port number')
  process.exit()
}

var env = process.env.NODE_ENV || argv.env || 'development'

var path = require('path')
var config = require(path.resolve(process.cwd(), argv.config))[env]

var express = require('express')
var parser = require('body-parser')
var hackernews = require('../')(config)

var server = express()
server.use(parser.urlencoded({extended: true}))

server.use((req, res) => {
  console.log(new Date().getTime(), new Date().toString())
  console.log(req.body)

  hackernews(req.body, (status) => console.log(status))
    .then((attachments) => res.json({attachments}))
})

server.listen(argv.port, () => {
  console.log('Oh Hi', argv.port, new Date().getTime(), new Date().toString(), '!')
})
