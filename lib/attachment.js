
module.exports = {
  ok: () => [{
    fallback: 'HackerNews',
    pretext: '> working ...',
    mrkdwn_in: ['pretext']
  }],

  help: () => [{
    fallback: 'HackerNews',
    text: [
      '*/hackernews* - defaults to the 5 newest stories',
      '*/hackernews* _new 5_ - the 5 newest stories',
      '*/hackernews* _top 3_ - the top 3 stories',
      '*/hackernews* _best 10_ - the 10 best stories'
    ].join('\n\n'),
    mrkdwn_in: ['text']
  }],

  error: (message) => [{
    fallback: 'HackerNews',
    color: 'danger',
    text: message,
    mrkdwn_in: ['text']
  }],

  item: (item) => ({
    fallback: 'HackerNews',
    color: '#ff6600',

    author_name: item.by,
    author_link: 'https://news.ycombinator.com/user?id=' + item.by,
    author_icon: 'https://news.ycombinator.com/y18.gif',

    title: item.title || (item.text && item.text.slice(0, 25)),
    title_link: item.url,

    text: (item.text ? (item.text + '\n') : '') +
      '<https://news.ycombinator.com/item?id=' + item.id +
      '|' + (item.descendants || 0) + ' comments>',

    footer: item.type.replace(/^(\w){1}/, item.type[0].toUpperCase()) +
      ' (' + (item.score || 0) + ' points)',
    ts: item.time,

    mrkdwn_in: ['text']
  })
}
