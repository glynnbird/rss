const Parser = require('rss-parser');
const crypto = require('crypto')
const AWS = require('aws-sdk')
const parser = new Parser();
const TABLE = process.env.TABLE
const documentClient = new AWS.DynamoDB.DocumentClient()
let params

const handler = async function (spec) {
  //first get the feed details
  params = {
    TableName: TABLE,
    Key: {
      pk: `feed#${spec.feedid}`
    }
  }
  console.log("loading feed ", spec.feed)
  const response = await documentClient.get(params).promise()
  const feeddata = response.Item
  console.log("feeddata is ", feeddata)

  //now get data from the rss feed
  let feed = await parser.parseURL(feeddata.link);
  console.log(feed.title);
  const cutoffDate = new Date(feeddata.timestamp).getTime()

  let docs = []
  feed.items.forEach(item => {
    let doc = {}
    const ts = new Date(item.isoDate)
    //TTL is the current time in seconds + the number of seconds in a month. In other words, expire docs after a month
    const TTL = Math.floor(new Date().getTime()/1000) + (60*60*24*30)  
    if (ts.getTime() > cutoffDate) {
      console.log(item)
      //create a unique id for the article
      var shasum = crypto.createHash('sha1')
      shasum.update(item.guid)
      const articleid = shasum.digest('hex')
      //build a line for dynamodb
      doc.pk = `article#${articleid}`
      doc.articleid = articleid
      doc.feedid = spec.feedid
      doc.timestamp = item.isoDate
      doc.link = item.link
      doc.title = item.title
      doc.content = item.content
      doc.feed_name = feeddata.feed_name
      doc.GSI1PK = `feed#${spec.feedid}`
      doc.GSI1SK = `#time#${item.isoDate}`
      doc.GSI2PK = "article"
      doc.GSI2SK = `#time#${item.isoDate}`
      doc.TTL = TTL


      //insert it into the array
      docs.push(doc)
    }
  });
  // now you have a docs array that you can push into dynamodb
  if (docs.length > 0) {
    console.log("docs array size is ", docs.length)
    docs = docs.slice(0, 25) //batch write only takes 25 items, so for now we truncate the array
    console.log("Writing articles to dynamo")
    try {
      params = { RequestItems: {} }
      params.RequestItems[TABLE] = docs.map(function (doc) {
        return { PutRequest: { Item: doc } }
      })

      await documentClient.batchWrite(params).promise()
    } catch (e) {
      console.log("Error writing to DynamoDB:", e)

    }
    // assume that the first item in the array is the latest one, so write its timestamp back into the feed
    // data so we know where to start from next time
    feeddata.timestamp = docs[0].timestamp
    params = {
      TableName: TABLE,
      Item: feeddata 
    }
    console.log("updating feed timestamp to ", feeddata.timestamp )
    await documentClient.put(params).promise()
  } else {
    console.log("No items to write")
  }

}

module.exports = { handler }