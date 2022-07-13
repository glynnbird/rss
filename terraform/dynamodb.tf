// DynamoDB rss feed table
resource "aws_dynamodb_table" "rssDB" {
  name = "rssDB"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "pk"

  attribute {
   name = "pk"
   type = "S"
  }

  attribute {
   name = "GSI1PK"
   type = "S"
  }
  attribute {
   name = "GSI1SK"
   type = "S"
  }

  attribute {
   name = "GSI2PK"
   type = "S"
  }

  attribute {
   name = "GSI2SK"
   type = "S"
  }

  global_secondary_index {
    name = "gsi1"
    hash_key = "GSI1PK"
    range_key = "GSI1SK"
    projection_type = "ALL"
  }

  global_secondary_index {
    name = "gsi2"
    hash_key = "GSI2PK"
    range_key = "GSI2SK"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  ttl {
    attribute_name = "TTL"
    enabled        = true
  }
}
