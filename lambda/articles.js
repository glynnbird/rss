const AWS = require('aws-sdk')
const TABLE = process.env.TABLE
const API_KEY = process.env.API_KEY
const documentClient = new AWS.DynamoDB.DocumentClient()
let params

const handler = async function (spec) {
  // first check if the API KEY is correct
  if (!spec.queryStringParameters || !spec.queryStringParameters.apikey || spec.queryStringParameters.apikey !== API_KEY) {
    return { statusCode: 401, body: '{"ok": false}' }
  }
  // first read articles in reverse chrono order
  params = {
    TableName: TABLE,
    IndexName: 'gsi2',
    KeyConditions: {
      GSI2PK: { ComparisonOperator: 'EQ', AttributeValueList: ['article'] },
      GSI2SK: { ComparisonOperator: 'BEGINS_WITH', AttributeValueList: ['#time#'] }
    },
    ScanIndexForward: false,
    Limit: 100
  }
  console.log('params are: ', params)
  console.log('loading articles ')
  const response = await documentClient.query(params).promise()
  const articledata = response.Items
  console.log('article data is ', articledata)

  return articledata
}

module.exports = { handler }
