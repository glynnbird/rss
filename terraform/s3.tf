#make every bucket name a random string because s3 has a universal namespace
resource "random_string" "bucketName" {
  length           = 20
  special          = false
  upper = false
  lower = true
}

# create the bucket that will host the site
resource "aws_s3_bucket" "rssWebsite" {
  bucket        = random_string.bucketName.result
  force_destroy = true
}

# access control set to private
resource "aws_s3_bucket_acl" "bucketACL" {
  bucket = aws_s3_bucket.rssWebsite.id
  acl    = "private"
}

# policy to allow Cloudfront to read-only from this S3 bucket
resource "aws_s3_bucket_policy" "cloudfront_s3_bucket_policy" {
  bucket = aws_s3_bucket.rssWebsite.id
  policy = jsonencode({
    Version = "2008-10-17"
    Id      = "PolicyForCloudFrontPrivateContent"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.rssWebsite.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.s3_distribution.arn
          }
        }
      }
    ]
  })
}

