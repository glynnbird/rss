
# feedFetch
module "feedFetch" {
  source        = "./modules/plainLambda"
  function_name = "feedfetch"
  role          = aws_iam_role.rssLambdaRole.arn
  table         = aws_dynamodb_table.rssDB.name
  layer         = aws_lambda_layer_version.rssLambdaLayer.arn
  api_key       = var.API_KEY
}

# feedDispatch
module "feedDispatch" {
  source        = "./modules/plainLambda"
  function_name = "feeddispatch"
  role          = aws_iam_role.rssLambdaRole.arn
  table         = aws_dynamodb_table.rssDB.name
  layer         = aws_lambda_layer_version.rssLambdaLayer.arn
  api_key       = var.API_KEY
  fetch_lambda  = module.feedFetch.function_name
}

# articles
module "articles" {
  source        = "./modules/apicall"
  function_name = "articles"
  role          = aws_iam_role.rssLambdaRole.arn
  table         = aws_dynamodb_table.rssDB.name
  layer         = aws_lambda_layer_version.rssLambdaLayer.arn
  api_key       = var.API_KEY
}
output "articlesFunctionUrl" {
  value = module.articles.url
}

# addFeed
module "addFeed" {
  source        = "./modules/apicall"
  function_name = "addfeed"
  role          = aws_iam_role.rssLambdaRole.arn
  table         = aws_dynamodb_table.rssDB.name
  layer         = aws_lambda_layer_version.rssLambdaLayer.arn
  api_key       = var.API_KEY
}
output "addFeedFunctionUrl" {
  value = module.addFeed.url
}

# deleteFeed
module "deleteFeed" {
  source        = "./modules/apicall"
  function_name = "deletefeed"
  role          = aws_iam_role.rssLambdaRole.arn
  table         = aws_dynamodb_table.rssDB.name
  layer         = aws_lambda_layer_version.rssLambdaLayer.arn
  api_key       = var.API_KEY
}
output "deleteFeedFunctionUrl" {
  value = module.deleteFeed.url
}

# getAllFeeds
module "getAllFeeds" {
  source        = "./modules/apicall"
  function_name = "getallfeeds"
  role          = aws_iam_role.rssLambdaRole.arn
  table         = aws_dynamodb_table.rssDB.name
  layer         = aws_lambda_layer_version.rssLambdaLayer.arn
  api_key       = var.API_KEY
}
output "getAllFeedsFunctionUrl" {
  value = module.getAllFeeds.url
}
