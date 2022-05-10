
//zip up all js files for the pipeline
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "../lambda"
  output_path = "../lambda.zip"
}


resource "aws_lambda_function" "feedFetch" {
  filename         = "../lambda.zip"
  function_name    = "feedfetch"
  role             = aws_iam_role.rssLambdaRole.arn
  handler          = "feedfetch.handler"
  runtime          = "nodejs14.x"
  timeout          = 10
  source_code_hash = data.archive_file.lambda.output_base64sha256
  //  layers           = [aws_lambda_layer_version.choirlessAPILambdaLayer.arn]

  environment {
    variables = {
      TABLE = aws_dynamodb_table.rssDB.name
    }
  }
  #   tags = var.tags

}

resource "aws_lambda_function" "feedDispatch" {
  filename         = "../lambda.zip"
  function_name    = "feeddispatch"
  role             = aws_iam_role.rssLambdaRole.arn
  handler          = "feeddispatch.handler"
  runtime          = "nodejs14.x"
  timeout          = 10
  source_code_hash = data.archive_file.lambda.output_base64sha256

  environment {
    variables = {
      TABLE        = aws_dynamodb_table.rssDB.name
      FETCH_LAMBDA = aws_lambda_function.feedFetch.function_name
    }
  }
  #   tags = var.tags

}

resource "aws_lambda_function" "articles" {
  filename         = "../lambda.zip"
  function_name    = "articles"
  role             = aws_iam_role.rssLambdaRole.arn
  handler          = "articles.handler"
  runtime          = "nodejs14.x"
  timeout          = 10
  source_code_hash = data.archive_file.lambda.output_base64sha256

  environment {
    variables = {
      TABLE = aws_dynamodb_table.rssDB.name
    }
  }
  #   tags = var.tags

}

resource "aws_lambda_function_url" "articlesFunctionUrl" {
  function_name      = aws_lambda_function.articles.function_name
  authorization_type = "NONE"
  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    max_age           = 86400
  }
}

output "articlesFunctionUrl" {
  value = aws_lambda_function_url.articlesFunctionUrl.function_url

}
