import fxp from 'fast-xml-parser'
import { get } from 'faviconer'
import { okResponse, notOkResponse, notOk } from './lib/constants.js'
import { mustBePOST, mustBeJSON, apiKey, handleCORS } from './lib/checks.js'
import { generateid } from './lib/utils.js'
import { add } from './lib/db.js'

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
}
const parser = new fxp.XMLParser(options)

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
    const feed = parser.parse(content).rss.channel
    console.log('feed', feed)

    // get the favicon
    const iconURL = await get(feed.link)

    // if an id is not supplied, generate one
    const id = 'feed#' + generateid()

    const doc = {
      link: json.url,
      feed_name: feed.title,
      icon: iconURL,
      feed_type: 'rss'
    }
    const metadata = {
      feed_name: feed.title,
      icon: doc.icon
    }

    // add to KV store
    const index = {}
    console.log('Adding', id, doc)
    const response = await add(context.env.KV, { id, doc, metadata, index })

    // send response
    return new Response(JSON.stringify(response), okResponse)
  }

  // everyone else gets a 400 response
  return new Response(notOk, notOkResponse)
}
