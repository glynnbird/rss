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

resource "aws_s3_bucket_website_configuration" "rssWebsiteConfig" {
  bucket = aws_s3_bucket.rssWebsite.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
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
        "AWS": "*"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${random_string.bucketName.result}/*"
    }
  ]
}
EOF
}

resource "aws_s3_bucket_acl" "rssWebsiteACL" {
  bucket = aws_s3_bucket.rssWebsite.bucket
  acl    = "public-read"
}
