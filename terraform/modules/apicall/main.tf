
//zip up  js files for the pipeline
data "archive_file" "lambda" {
  type        = "zip"
  source_file =  "../lambda/${var.function_name}.js"
  output_path = "../lambda/${var.function_name}.zip"
}

resource "aws_lambda_function" "apiLambda" {
  filename         = data.archive_file.lambda.output_path
  function_name    = "${var.function_name}-${terraform.workspace}"
  role             = var.role
  handler          = "${var.function_name}.handler"
  runtime          = var.runtime
  timeout          = var.timeout
  source_code_hash = data.archive_file.lambda.output_base64sha256
  layers           = [var.layer]
  
  environment {
    variables = {
      TABLE = var.table
      API_KEY = var.api_key
    }
  }
}

resource "aws_cloudwatch_log_group" "apiLG" {
  name              = "/aws/lambda/${var.function_name}-${terraform.workspace}"
  retention_in_days = 7
}

resource "aws_lambda_function_url" "apiFunctionUrl" {
  function_name      = aws_lambda_function.apiLambda.function_name
  authorization_type = "NONE"
  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    max_age           = 86400
  }
}

output "url" {
  value = aws_lambda_function_url.apiFunctionUrl.function_url
}

output "arn" {
  value = aws_lambda_function.apiLambda.arn
}

output "function_name" {
  value = aws_lambda_function.apiLambda.function_name
}
