terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.68.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.42.0"
    }
  }

  required_version = ">= 1.3"
}
