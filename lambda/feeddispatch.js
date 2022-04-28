const AWS = require('aws-sdk')
const TABLE = process.env.TABLE
const FETCH_LAMBDA = process.env.FETCH_LAMBDA
const documentClient = new AWS.DynamoDB.DocumentClient()
const lambda = new AWS.Lambda()

const handler = async function () {
  // load all feeds
  const req = {
    TableName: TABLE,
    KeyConditions: {
      pk: { ComparisonOperator: 'BEGINS_WITH', AttributeValueList: ['feed#'] }
    }
  }
  console.log("loading feed list ")
  const response = await documentClient.query(req).promise()
  const feeds = response.Items
  console.log("feeds", feeds)

  // invoke a lambda to fetch each feed
  for (var i = 0; i < feeds.length; i++) {
    const params = {
      FunctionName: FETCH_LAMBDA, // the lambda function we are going to invoke
      InvocationType: 'Event',
      Payload: JSON.stringify({ feedid: feeds.feedid })
    }
    console.log('invoking lambda for feed', feeds.feedid)
    const ret = await lambda.invoke(params).promise()
  }
}