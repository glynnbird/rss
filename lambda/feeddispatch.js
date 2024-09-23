const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { Lambda } = require('@aws-sdk/client-lambda');

const TABLE = process.env.TABLE
const FETCH_LAMBDA = process.env.FETCH_LAMBDA
const documentClient = DynamoDBDocument.from(new DynamoDB())
const lambda = new Lambda()

const handler = async function () {
  // load all feeds
  const req = {
    TableName: TABLE,
    IndexName: 'gsi1',
    KeyConditions: {
      GSI1PK: { ComparisonOperator: 'EQ', AttributeValueList: ['feed'] },
      GSI1SK: { ComparisonOperator: 'BEGINS_WITH', AttributeValueList: ['#'] }
    }
  }
  console.log('loading feed list ')
  const response = await documentClient.query(req)
  const feeds = response.Items
  console.log('feeds', feeds)

  // invoke a lambda to fetch each feed
  for (let i = 0; i < feeds.length; i++) {
    const params = {
      FunctionName: FETCH_LAMBDA, // the lambda function we are going to invoke
      InvocationType: 'Event',
      Payload: JSON.stringify({ feedid: feeds[i].feedid })
    }
    console.log('invoking lambda for feed', feeds[i].feedid)
    await lambda.invoke(params)
  }
}

module.exports = { handler }
