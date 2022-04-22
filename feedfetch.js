const Parser = require('rss-parser');
const parser = new Parser();


const main = async function (spec) {
  let feed = await parser.parseURL(spec.url);
  console.log(feed.title);
  const cutoffDate = new Date(spec.date).getTime()

  feed.items.forEach(item => {
    const ts = new Date(item.isoDate)
    if (ts.getTime() > cutoffDate) {
      console.log(item)
    }
  });
}

main({
  url: 'https://www.theguardian.com/uk/rss',
  date: '2022-04-22T00:00:00.000Z'
})