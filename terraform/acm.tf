# HTTPS certificate for Cloudfront

resource "aws_acm_certificate" "rssCert" {
  #deployed in us-east
  provider          = aws.useast
  domain_name       = "aws_s3_bucket_website_configuration.rssWebsiteConfig.website_domain"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}