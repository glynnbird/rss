import * as htmlparser2 from "htmlparser2";
import { okResponse, notOkResponse, notOk } from './lib/constants.js'
import { mustBePOST, mustBeJSON, apiKey, handleCORS } from './lib/checks.js'
import { generateid } from './lib/utils.js'

export async function onRequest (context) {
  // handle POST/JSON/apikey chcecks
  const r = handleCORS(context.request) || apiKey(context.request, context.env) || mustBePOST(context.request) || mustBeJSON(context.request)
  if (r) return r

  // parse the json
  const json = await context.request.json()

  // if the mandatiry fields are there
  if (json.url) {

    // load the URL
    const r = await fetch(json.url)
    const content = await r.text()

    // parse the feed
    const feed = htmlparser2.parseFeed(content, {});
    console.log('feed', feed)

    // if an id is not supplied, generate one
    const id = 'feed#' + generateid()

    const doc = {
      timestamp: '2000-01-01T00:00:00.000Z',
      link: json.url,
      feed_name: feed.title,
      icon: iconURL,
      feed_type: 'rss'
    }
    const metadata = {
      feed_name: feed.title
    }

    // add to KV store
    const index = {}
    const response = await add(context.env.KV, { id, doc, metadata, index })

    // send response
    return new Response(JSON.stringify(response), okResponse)
  }

  // everyone else gets a 400 response
  return new Response(notOk, notOkResponse)
}
