resource "aws_iam_role" "rssLambdaRole" {
  name = "rssLambdaRole"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

//add inline policy that allows writing to logs and invoking lambda functions

resource "aws_iam_role_policy" "rssInlinePolicy" {
  name = "rssInlinePolicy"
  role = aws_iam_role.rssLambdaRole.id

  policy = <<-EOF
  {
    "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                "Resource": "arn:aws:logs:*:*:*"
            },
            { 
                "Effect": "Allow", 
                "Action": [ "lambda:InvokeFunction" ], 
                "Resource": ["*"]
	    },
            {
                "Effect": "Allow",
                "Action": [ "dynamodb:*" ],
                "Resource": ["arn:aws:dynamodb:*:*:table/*"]
            }
        ]
  }
  EOF
}
