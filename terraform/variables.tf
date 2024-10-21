variable "API_KEY" {
  description = "the apikey from the user"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  type = string
  sensitive = true
}
variable "cloudflare_account_id" {
  type = string
  sensitive = true
}
variable "cloudflare_zone_id" {
  type = string
  sensitive = true
}
variable "cloudflare_domain" {
  type = string
}
