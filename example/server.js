
var express = require('express')
var parser = require('body-parser')

var hackernews = require('../')
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
