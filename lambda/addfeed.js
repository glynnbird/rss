const AWS = require('aws-sdk')
const TABLE = process.env.TABLE
const documentClient = new AWS.DynamoDB.DocumentClient()
const Parser = require('rss-parser');
const parser = new Parser();
const crypto = require('crypto')
let params

const hash = function (str) {
  var shasum = crypto.createHash('sha1')
  shasum.update(str)
  return shasum.digest('hex')
}

const handler = async function (spec) {
  console.log("spec is ", spec)

  // fetch the feed
  let feed
  try {
    feed = await parser.parseURL(spec.queryStringParameters.url);
  } catch (e) {
    return { statusCode: 400, body: '{"ok":false}' }
  }

  const feed_name = feed.title
  const feedid = hash(feed.link)
  const link = spec.queryStringParameters.url
  console.log(feed_name, feedid, link)

  // create dynamodb object
  // set the initial timestamp to be in the past so that the first
  // fetch of the feed fetches everything
  const item = {
    pk: `feed#${feedid}`,
    feedid: feedid,
    timestamp: "2000-01-01T00:00:00.000Z",
    link: link,
    feed_name: feed_name,
    GSI1PK: 'feed',
    GSI1SK: `#feed#${feedid}`
  }

  // add the feed to the database
  params = {
    TableName: TABLE,
    Item: item
  }
  console.log("writing this:", item)
  await documentClient.put(params).promise()
  return { statusCode: 200, body: `{"ok": true, "feedid":"${feedid}"}` }

}

module.exports = { handler }
