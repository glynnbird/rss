import { XMLParser } from 'fast-xml-parser'
import { okResponse, notOkResponse, notOk } from './lib/constants.js'
import { mustBePOST, mustBeJSON, apiKey, handleCORS } from './lib/checks.js'
import { get } from './lib/db.js'

const options = {
  ignoreAttributes: false,
  attributeNamePrefix : "@_"
};
const parser = new XMLParser(options)

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
      const items =  parser.parse(str).rss.channel.item.map((i) => {
        i.description = i.description.trim()
        i.guid = hash(JSON.stringify(i.guid))
        if (i['media:thumbnail'] && i['media:thumbnail']['@_url']) {
          i.media = i['media:thumbnail']['@_url']
        }
        if (i['media:content'] && i['media:content'][0] && i['media:content'][0]['@_url']) {
          i.media = i['media:content'][0]['@_url']
        }
        i.pubDate = new Date(i.pubDate).toISOString()
        delete i['media:thumbnail']
        delete i['media:content']
        delete i['dc:creator']
        delete i['dc:date']
        delete i['category']
        delete i['content:encoded']
      })
      response = {
        ok: true,
        feed: items
      }
      console.log('polledFeed', polledFeed)
        
      // send response
      return new Response(JSON.stringify(response), okResponse)

    }
  }

  // everyone else gets a 400 response
  return new Response(notOk, notOkResponse)
}
