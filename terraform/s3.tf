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
  acl    = "public-read"
}

resource "aws_s3_bucket_policy" "rssWebsitePolicy" {
  bucket = aws_s3_bucket.rssWebsite.bucket
  policy = <<EOF
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "Allow Public Browsing",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "${aws_s3_bucket.rssWebsite.arn}/*"
    }
  ]
}
EOF
}

// public website served from S3
resource "aws_s3_bucket_website_configuration" "rssWebsiteConfig" {
  bucket = aws_s3_bucket.rssWebsite.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}



output "httpURL" {
  value = aws_s3_bucket_website_configuration.rssWebsiteConfig.website_endpoint
}
