
module.exports = (input) => {
  var stream = 'new'
  var limit = 5

  if (!input) {
    return {stream, limit}
  }

  var params = input.split(' ')

  if (params[0] && /top|best|new/.test(params[0])) {
    stream = params[0]
  }

  if (params[1]) {
    var num = parseInt(params[1])
    if (num && num <= 10) {
      limit = num
    }
  }

  return {stream, limit}
}
