# rss

A news feed aggregator that can be deployed on AWS for near $0 for personal use.

- static web app hosted on S3
- HTTP API hosted on Lambda
- periodic polling of RSS/Atom news feeds using Lambda
- state stored in DynamoDB

## How it works

![schematic](rss_diagram.png)