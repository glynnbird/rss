const AWS = require('aws-sdk')
const TABLE = process.env.TABLE
const documentClient = new AWS.DynamoDB.DocumentClient()
let params

const handler = async function (spec) {
  console.log("spec is ", spec)

  const feedid = spec.queryStringParameters.feedid

  // delete the feed from the database
  params = {
    TableName: TABLE,
    Key: {
      pk: `feed#${feedid}`
    }
  }
  console.log("deleting this: ", params)
  await documentClient.delete(params).promise()
  return { statusCode: 200, body: `{"ok": true, "feedid":"${feedid}"}` }

}

module.exports = { handler }
