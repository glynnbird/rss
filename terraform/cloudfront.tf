locals {
  s3_origin_id = "myS3ForRSSWebsite"
}

# CloudFront distribution for the main choirless website
resource "aws_cloudfront_distribution" "s3_distribution" {
  //origin says where the website is located. In our case it is an S3 bucket
  origin {
    domain_name              = aws_s3_bucket.rssWebsite.bucket_regional_domain_name
    origin_id                = local.s3_origin_id
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "The RSS Cloudfront Distribution"
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

  //priceclass 100 is the cheapest.. see https://aws.amazon.com/cloudfront/pricing/
  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  //this is the SSL certificate used by the distribution
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  //to ensure that nuxtjs paths (which do not actually exist) get served out without showing a 404 error
  custom_error_response {
    response_page_path = "/404.html"
    error_code         = 404
    response_code      = 200
  }
}

output "cloudfrontHostname" {
  value = aws_cloudfront_distribution.s3_distribution.domain_name
}
