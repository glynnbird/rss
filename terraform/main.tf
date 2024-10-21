data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

provider "aws" {
  region = "eu-west-1"
}

# API key needed to access the API
resource "random_string" "apiKey" {
  length           = 20
  special          = false
  upper            = false
  lower            = true
}
output apiKey {
  value = random_string.apiKey.id
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

output "region" {
  value = data.aws_region.current.name
}
