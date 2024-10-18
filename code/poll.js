import * as htmlparser2 from "htmlparser2";
import { okResponse, notOkResponse, notOk } from './lib/constants.js'
import { mustBePOST, mustBeJSON, apiKey, handleCORS } from './lib/checks.js'
import { get } from './lib/db.js'

export async function onRequest (context) {
  // handle POST/JSON/apikey chcecks
  const r = handleCORS(context.request) || apiKey(context.request, context.env) || mustBePOST(context.request) || mustBeJSON(context.request)
  if (r) return r

  // parse the json
  const json = await context.request.json()
  let response

  // if the mandatiry fields are there
  if (json.id) {

    const dbr = await get(context.env.KV, json.id)
    console.log('dbr', dbr)
    if (dbr.ok) {
      const feed = dbr.doc
      console.log('Got feed', feed)

      // load the URL
      const r = await fetch(feed.link)
      const content = await r.text()

      // parse the feed
      const polledFeed = htmlparser2.parseFeed(content, {
        xmlMode: true,
        decodeEntities: true,
        recognizeCDATA: true
      });
      resoponse = {
        ok: true,
        feed: polledFeed
      }
      console.log('polledFeed', polledFeed)
        
      // send response
      return new Response(JSON.stringify(response), okResponse)

    }
  }

  // everyone else gets a 400 response
  return new Response(notOk, notOkResponse)
}
