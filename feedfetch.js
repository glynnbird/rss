const Parser = require('rss-parser');
const parser = new Parser();

const handler = async function (opts) {
  const spec = opts.queryStringParameters // GET arguments
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

module.exports = { handler }