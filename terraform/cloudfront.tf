locals {
  s3_origin_id = "rssWebsite-prod"
}

# CloudFront distribution for the main website
resource "aws_cloudfront_distribution" "s3_distribution" {
  //origin says where the website is located. In our case it is an S3 bucket
  origin {

    custom_origin_config {
      // These are all the defaults.
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    domain_name = aws_s3_bucket.rssWebsite.website_endpoint
    origin_id   = local.s3_origin_id

  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "The RSS Cloudfront distribution"
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }
  //this tells CF what domains to serve content from apart from its on cloudfront.com one
  aliases = [aws_s3_bucket_website_configuration.rssWebsiteConfig.website_domain]

  //priceclass 100 is the cheapest.. see https://aws.amazon.com/cloudfront/pricing/
  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  //this is the SSL certificate used by the distribution
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.rssCert.arn
    ssl_support_method  = "sni-only"
    # minimum_protocol_version = "TLSv1.2_2019"
  }
  //to ensure that nuxtjs paths (which do not actually exist) get served out without showing a 404 error
  // 
  custom_error_response {
    response_page_path = "/404.html"
    error_code         = 404
    response_code      = 200
  }
}
