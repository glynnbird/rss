resource "aws_s3_bucket" "rssLambdaCode" {
  bucket = "rssgrb-lambda-code-${terraform.workspace}"
}
