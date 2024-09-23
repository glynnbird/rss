
const crypto = require('crypto')

const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const { DynamoDB } = require('@aws-sdk/client-dynamodb');

const Parser = require('rss-parser')
const getMetaData = require('metadata-scraper')
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content', { keepArray: true }]
    ]
  }
})

// return the last image's URL
const returnImageURL = function (media) {
  const lastItem = media[media.length - 1]
  if (lastItem && lastItem.$ && lastItem.$.url) {
    return lastItem.$.url
  } else {
    return null
  }
}

// fetch an image URL from a URLs
const scrapeImageURL = async function (url) {
  console.log('scraping', url)
  try {
    const response = await getMetaData(url)
    console.log('found', response.image)
    return response.image
  } catch (e) {
    console.log(e)
  }
  console.log('found nothing')
  return null
}

const TABLE = process.env.TABLE
const documentClient = DynamoDBDocument.from(new DynamoDB())
const stripHtml = require('string-strip-html').stripHtml
let params

const handler = async function (spec) {
  // first get the feed details
  params = {
    TableName: TABLE,
    Key: {
      pk: `feed#${spec.feedid}`
    }
  }
  console.log('loading feed ', spec.feed)
  const response = await documentClient.get(params)
  const feeddata = response.Item
  console.log('feeddata is ', feeddata)
  let docs = []
  let feed

  if (feeddata.feed_type && feeddata.feed_type === 'twitter') {
    // this is a Twitter feed
    console.log('We no longer do Twitter feeds')
    return
  } else {
    // this is an RSS feed
    // now get data from the rss feed
    feed = await parser.parseURL(feeddata.link)
    console.log(feed.title)
  }

  const cutoffDate = new Date(feeddata.timestamp).getTime()
  for (let i = 0; i < feed.items.length; i++) {
    const item = feed.items[i]
    const doc = {}
    const ts = new Date(item.isoDate)
    // TTL is the current time in seconds + the number of seconds in a week. In other words, expire docs after a week
    const TTL = Math.floor(new Date().getTime() / 1000) + (60 * 60 * 24 * 7)
    if (ts.getTime() > cutoffDate) {
      console.log(item)
      // create a unique id for the article
      const shasum = crypto.createHash('sha1')
      shasum.update(item.link)
      const articleid = shasum.digest('hex')
      // build a line for dynamodb
      doc.pk = `article#${articleid}`
      doc.articleid = articleid
      doc.feedid = spec.feedid
      doc.timestamp = item.isoDate
      doc.link = item.link
      doc.title = item.title
      doc.content = item.content
      doc.feed_name = feeddata.feed_name
      doc.icon = feeddata.icon
      doc.GSI1PK = `feed#${spec.feedid}`
      doc.GSI1SK = `#time#${item.isoDate}`
      doc.GSI2PK = 'article'
      doc.GSI2SK = `#time#${item.isoDate}`
      doc.TTL = TTL
      // Twitter media
      if (item.media) {
        doc.media = item.media
      }
      // RSS media
      if (item['media:content']) {
        const url = returnImageURL(item['media:content'])
        if (url) {
          doc.media = url
        }
      }
      // scrape image if there isn't one
      if (!doc.media && feeddata.feed_type !== 'twitter') {
        const url = await scrapeImageURL(doc.link)
        if (url) {
          doc.media = url
        }
      }

      // only keep first line of content - keep data items smaller
      const c = doc.content.replace(/(<\/[^>]+>)/, '$1\n')
      const lines = c.split('\n')

      // strip HTML tags from content
      doc.content = stripHtml(lines[0]).result

      // insert it into the array
      docs.push(doc)
      if (docs.length >= 15) {
        break
      }
    }
  }

  // now you have a docs array that you can push into dynamodb
  if (docs.length > 0) {
    console.log('docs array size is ', docs.length)
    docs = docs.slice(0, 25) // batch write only takes 25 items, so for now we truncate the array
    console.log('Writing articles to dynamo')
    try {
      params = { RequestItems: {} }
      params.RequestItems[TABLE] = docs.map(function (doc) {
        return { PutRequest: { Item: doc } }
      })

      await documentClient.batchWrite(params)
    } catch (e) {
      console.log('Error writing to DynamoDB:', e)
    }
    // assume that the first item in the array is the latest one, so write its timestamp back into the feed
    // data so we know where to start from next time
    feeddata.timestamp = docs[0].timestamp
    params = {
      TableName: TABLE,
      Item: feeddata
    }
    console.log('updating feed timestamp to ', feeddata.timestamp)
    await documentClient.put(params)
  } else {
    console.log('No items to write')
  }
}

module.exports = { handler }
