# rss

A news feed aggregator that can be deployed on Cloudflare's cloud.

## How it works

![schematic](rss_diagram.png)

## How to deploy

### Pre-requisites

1. A Cloudflare and a domain name that is under Cloudflare's DNS control
2. [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli)
3. [NodeJS and npm](https://nodejs.org/en/download/) 


### Step 1 - Clone repo

```
git clone https://github.com/glynnbird/rss.git
cd rss
```

### Step 2 - Define constants

In the `terraform` directory, create a file called terraform.tfvars with the following data

```
cloudflare_api_token="xxx"
cloudflare_api_token="yyy"
cloudflare_account_id="zzz"
cloudflare_zone_id="axaxa"
cloudflare_domain="some.domain.com"
```

### Step 3 - Create Infrastructure

In the root of the project type:

```
cd terraform
terraform init
terraform apply --auto-approve
```

------

## API calls

```sh
# add a feed
curl -X POST -H'Content-type:application/json' -H"apikey: $APIKEY" -d'{"url":"http://newsrss.bbc.co.uk/rss/sportonline_uk_edition/football/rss.xml"}' "https://rss.glynnbird.com/api/add"

# list feeds
curl -X POST -H'Content-type:application/json' -H"apikey: $APIKEY" "https://rss.glynnbird.com/api/list"

# poll a feed
curl -X POST -H'Content-type:application/json' -H"apikey: $APIKEY" -d'{"id":"feed#UZJXCNHQ"}' "https://rss.glynnbird.com/api/poll"

# poll a feed with a since date
curl -X POST -H'Content-type:application/json' -H"apikey: $APIKEY" -d'{"id":"feed#MXHRAVDG","since":"2024-10-21T06:56:22.000Z"}' "https://rss.glynnbird.com/api/poll"

# delete a feed
curl -X POST -H'Content-type:application/json' -H"apikey: $APIKEY" -d'{"id":"feed#MXHRAVDG"}' "https://rss.glynnbird.com/api/del"
```
