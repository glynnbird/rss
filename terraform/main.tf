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
