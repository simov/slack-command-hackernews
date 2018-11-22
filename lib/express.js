
var express = require('express')
var parser = require('body-parser')
var command = require('./command')


module.exports = (auth) => express()
  .use(parser.urlencoded({extended: true}))
  .use((req, res) => {
    var input = req.body
    res.json(command.respond({auth, input}))
    command.execute({auth, input}).catch(console.error)
  })
