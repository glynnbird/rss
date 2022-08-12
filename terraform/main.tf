data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

provider "aws" {
  region = "eu-west-1"
}

#this is the provider for deploying a certificate to the us-east-region
provider "aws" {
  alias = "useast"
  region = "us-east-1"
}

output "region" {
  value = data.aws_region.current.name
}