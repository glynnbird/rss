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

resource "aws_s3_bucket_website_configuration" "rssWebsiteConfig" {
  bucket = aws_s3_bucket.rssWebsite.bucket
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "404.html"
  }
}
