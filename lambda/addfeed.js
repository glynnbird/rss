const AWS = require('aws-sdk')
const TABLE = process.env.TABLE
const API_KEY = process.env.API_KEY
const documentClient = new AWS.DynamoDB.DocumentClient()
const Parser = require('rss-parser')
const parser = new Parser()
const crypto = require('crypto')
const faviconer = require('faviconer')
let params

const hash = function (str) {
  const shasum = crypto.createHash('sha1')
  shasum.update(str)
  return shasum.digest('hex')
}

const handler = async function (spec) {
  // first check if the API KEY is correct
  if (!spec.queryStringParameters || !spec.queryStringParameters.apikey || spec.queryStringParameters.apikey !== API_KEY) {
    return { statusCode: 401, body: '{"ok": false}' }
  }

  console.log('spec is ', spec)
  let feedType
  let item
  let feedid

  // if the url starts with an "@", it's a twitter feed
  if (spec.queryStringParameters.url.match(/^@/)) {
    // if we've got Twitter cres
    if (!process.env.TWITTER_BEARER_TOKEN) {
      return { statusCode: 401, body: '{"ok": false, "err": "Cannot do Twitter feeds"}' }
    }
    console.log('this is twitter feed')
    feedType = 'twitter'

    // load the Twitter feed meta data
    const tweetfetch = require('@glynnbird/tweetfetch')
    const feed = await tweetfetch.fetch(spec.queryStringParameters.url)
    if (!feed.ok) {
      return { statusCode: 401, body: '{"ok": false, "err": "Cannot find Twitter feed"}' }
    }
    feedid = hash(spec.queryStringParameters.url)
    item = {
      pk: `feed#${feedid}`,
      feedid,
      timestamp: '2000-01-01T00:00:00.000Z',
      link: spec.queryStringParameters.url,
      feed_name: feed.name,
      icon: feed.profile_image_url,
      feed_type: feedType,
      GSI1PK: 'feed',
      GSI1SK: `#feed#${feedid}`
    }
  } else {
    // this is an RSS feed
    feedType = 'rss'

    // fetch the feed
    let feed
    try {
      feed = await parser.parseURL(spec.queryStringParameters.url)
    } catch (e) {
      return { statusCode: 400, body: '{"ok":false}' }
    }

    feedid = hash(spec.queryStringParameters.url)
    const link = spec.queryStringParameters.url
    const pageURL = feed.link
    console.log(feed.title, feedid, link, pageURL)
    const iconURL = await faviconer.get(pageURL)

    // create dynamodb object
    // set the initial timestamp to be in the past so that the first
    // fetch of the feed fetches everything
    item = {
      pk: `feed#${feedid}`,
      feedid,
      timestamp: '2000-01-01T00:00:00.000Z',
      link,
      feed_name: feed.title,
      icon: iconURL,
      feed_type: feedType,
      GSI1PK: 'feed',
      GSI1SK: `#feed#${feedid}`
    }
  }

  // add the feed to the database
  params = {
    TableName: TABLE,
    Item: item
  }
  console.log('writing this:', item)
  await documentClient.put(params).promise()
  return { statusCode: 200, body: `{"ok": true, "feedid":"${feedid}"}` }
}

module.exports = { handler }
