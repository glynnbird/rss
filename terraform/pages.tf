# Basic project
resource "cloudflare_pages_project" "frontend_project" {
  account_id        = var.cloudflare_account_id
  name              = "rss"
  production_branch = "main"
  
  build_config = {
    build_command       = "./build.sh"
    destination_dir     = "dist"
    root_dir            = "/"
  }

  source = {
    type = "github"
    config = {
      owner                         = "glynnbird"
      repo_name                     = "rss"
      production_branch             = "main"
    }
  }
    deployment_configs = {
      preview = {
         env_vars = {
          NODE_VERSION = {
            type = "plain_text"
            value = "22"
          }
          API_KEY = {
            type = "plain_text"
            value = random_string.apiKey.id
          }
        }

        kv_namespaces = {
          KV ={
            namespace_id = cloudflare_workers_kv_namespace.rsskv.id
          }
        }
      }
      production = {
        env_vars = {
          NODE_VERSION = {
            type = "plain_text"
            value = "22"
          }
          API_KEY = {
            type = "plain_text"
            value = random_string.apiKey.id
          }
        }

        kv_namespaces = {
          KV ={
            namespace_id = cloudflare_workers_kv_namespace.rsskv.id
          }
        }
      }
  }
}

resource "cloudflare_pages_domain" "frontend_domain" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.frontend_project.name
  name       = var.cloudflare_domain
}

resource "cloudflare_dns_record" "frontend_dns" {
  zone_id = var.cloudflare_zone_id
  name    = "rss"
  content   = cloudflare_pages_project.frontend_project.subdomain
  type    = "CNAME"
  ttl     = 3600
}
