const AWS = require('aws-sdk')
const TABLE = process.env.TABLE
const API_KEY = process.env.API_KEY
const documentClient = new AWS.DynamoDB.DocumentClient()

const handler = async function (spec) {
  //first check if the API KEY is correct
  if (!spec.queryStringParameters || !spec.queryStringParameters.apikey || spec.queryStringParameters.apikey !== API_KEY)  {
    return { statusCode: 401, body: `{"ok": false}` }
  }
  // load all feeds
  const req = {
    TableName: TABLE,
    IndexName: 'gsi1',
    KeyConditions: {
      GSI1PK: { ComparisonOperator: 'EQ', AttributeValueList: ['feed'] },
      GSI1SK: { ComparisonOperator: 'BEGINS_WITH', AttributeValueList: ['#'] }
    }
  }
  console.log("loading feed list ")
  const response = await documentClient.query(req).promise()
  const feeds = response.Items
    console.log("feeds", feeds)
  const feedobj = {
    ok:true,
    feeds: feeds.map (function (i) {
      delete i.GSI1PK
      delete i.GSI1SK
      delete i.pk
      return i
    })
  }

//return all feeds
return { statusCode: 200, body: JSON.stringify(feedobj) }
}

module.exports = { handler }