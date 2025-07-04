terraform {
  backend "s3" {
    bucket = "grb-terraform-state"
    key    = "rss/terraform.tfstate"
    region = "eu-west-1"
  }
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.5.0"
    }
  }

  required_version = ">= 1.3"
}
