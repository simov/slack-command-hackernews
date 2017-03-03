#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2))

if (argv.help) {
  console.log('--env development|staging|production')
  console.log('--port number')
  console.log('--config path/to/config.json')
  process.exit()
}

if (!argv.port) {
  console.error('Specify --port number')
  process.exit()
}

if (!argv.config) {
  console.error('Specify --config file')
  process.exit()
}

var path = require('path')
var env = process.env.NODE_ENV || argv.env || 'development'
var config = require(path.resolve(process.cwd(), argv.config))[env]

var express = require('express')
var bodyParser = require('body-parser')
var logger = require('morgan')
var hackernews = require('../lib/')(config)

var server = express()
server.use(logger('dev'))
server.use(bodyParser.urlencoded({extended: true}))

server.use((req, res) => {
  hackernews(req, (err, attachments) => {
    res.json({attachments})
  })
})

server.listen(argv.port, () => console.log('Oh Hi', argv.port, '!'))
