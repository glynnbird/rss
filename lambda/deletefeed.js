const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const { DynamoDB } = require('@aws-sdk/client-dynamodb');

const TABLE = process.env.TABLE
const API_KEY = process.env.API_KEY
const documentClient = DynamoDBDocument.from(new DynamoDB())
let params

const handler = async function (spec) {
  // first check if the API KEY is correct
  if (!spec.queryStringParameters || !spec.queryStringParameters.apikey || spec.queryStringParameters.apikey !== API_KEY) {
    return { statusCode: 401, body: '{"ok": false}' }
  }
  console.log('spec is ', spec)

  const feedid = spec.queryStringParameters.feedid

  // delete the feed from the database
  params = {
    TableName: TABLE,
    Key: {
      pk: `feed#${feedid}`
    }
  }
  console.log('deleting this: ', params)
  await documentClient.delete(params)
  return { statusCode: 200, body: `{"ok": true, "feedid":"${feedid}"}` }
}

module.exports = { handler }
