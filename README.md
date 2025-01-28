# rss

A news feed aggregator that can be deployed on Cloudflare's cloud.

## How it works

The Cloudflare KV store is used to keep a list of feeds. A website produce by Nuxt is deployed to Cloudflare Pages with and API built from the `code` directory and served out at the websites `/api/xxx` path. e..g

- `POST /api/list` - get a list of RSS feeds
- `POST /api/add` - add an RSS feed to the list
- `POST /api/del` - delete an RSS feed from the list
- `POST /api/poll` - poll a single RSS feed

The web front end calls `/api/poll` for each feed in the list when the page is refreshed and stores the resultant articles in `localStorage`. The next time the feeds are polled a `since` parameter is sent so that the same stories are not sent more than once. Stories are deduped using the `guid` of the story which is calculated as the hash of the story's `link url.

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

# get image data for a url
curl -X POST -H'Content-type:application/json' -H"apikey: $APIKEY" -d'{"url":"https://www.theguardian.com/football/2024/oct/21/big-stat-replaces-big-sam-how-premier-league-clubs-recruit-elite-managers"}' "https://rss.glynnbird.com/api/image"

# poll a feed with a since date
curl -X POST -H'Content-type:application/json' -H"apikey: $APIKEY" -d'{"id":"feed#MXHRAVDG","since":"2024-10-21T06:56:22.000Z"}' "https://rss.glynnbird.com/api/poll"

# delete a feed
curl -X POST -H'Content-type:application/json' -H"apikey: $APIKEY" -d'{"id":"feed#MXHRAVDG"}' "https://rss.glynnbird.com/api/del"
```

## Tail the logs

```sh
wrangler pages deployment tail --project-name rss
```
