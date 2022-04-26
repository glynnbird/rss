const Parser = require('rss-parser');
const parser = new Parser();
const TABLE = process.env.TABLE

const handler = async function (spec) {
  let feed = await parser.parseURL(spec.url);
  console.log(feed.title);
  const cutoffDate = new Date(spec.date).getTime()
  feed.items.forEach(item => {
    const ts = new Date(item.isoDate)
    if (ts.getTime() > cutoffDate) {
      console.log(item)

      try {
        debug('postChoir write choir', doc)
        doc.pk = `choir#${doc.choirId}`
        doc.sk = '#profile'
        const req = {
          TableName: aws.TABLE,
          Item: doc
        }
        await aws.documentClient.put(req).promise()
    }
  });
}

module.exports = { handler }