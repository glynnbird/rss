resource "cloudflare_workers_kv_namespace" "rsskv" {
  account_id = var.cloudflare_account_id
  title      = "rss-${terraform.workspace}"
}

output "kv_id" {
  value = cloudflare_workers_kv_namespace.rsskv.id
}
