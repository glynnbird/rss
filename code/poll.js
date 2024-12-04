import fxp from 'fast-xml-parser'
import { stripHtml } from 'string-strip-html'
import { okResponse, notOkResponse, notOk } from './lib/constants.js'
import { mustBePOST, mustBeJSON, apiKey, handleCORS } from './lib/checks.js'
import { get } from './lib/db.js'

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
}
const parser = new fxp.XMLParser(options)

const hash = async (str) => {
  const msgUint8 = new TextEncoder().encode(str) // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('MD5', msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
  return hashHex
}

export async function onRequest (context) {
  // handle POST/JSON/apikey chcecks
  const r = handleCORS(context.request) || apiKey(context.request, context.env) || mustBePOST(context.request) || mustBeJSON(context.request)
  if (r) return r

  // parse the json
  const json = await context.request.json()
  let response

  // make a note of the current time and the time at midnight today
  const d = new Date()
  const now = d.toISOString()
  d.setHours(0,0,0,0)
  const midnight = d.toISOString()

  // if the mandatory fields are there
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
      let items = parser.parse(content).rss.channel.item
      items.splice(15) // remove everything but the first 15 items
      items = items.map((i) => {
        const c = i.content || i.description
        const lines = c.split('\n')
        i.description = stripHtml(lines[0]).result
        const sentences = i.description.split('. ')
        if (sentences.length > 1) {
          i.description = sentences[0] + '.'
        }
        i.guid = ''
        if (i['media:thumbnail'] && i['media:thumbnail']['@_url']) {
          i.media = i['media:thumbnail']['@_url']
        }
        if (i['media:content'] && i['media:content'].length > 0) {
          const l = i['media:content'].length
          i.media = i['media:content'][l - 1]['@_url']
        }
        i.pubDate = new Date(i.pubDate).toISOString()
        // if the publication date is in the future, then move it midnight today
        if (i.pubDate > now) {
          i.pubDate = midnight
        }
        delete i['media:thumbnail']
        delete i['media:content']
        delete i['dc:creator']
        delete i['dc:date']
        delete i.category
        delete i['content:encoded']
        return i
      })
      console.log('hashing', items.length)
      for (let i = 0; i < items.length; i++) {
        items[i].guid = await hash(items[i].link)
      }

      // apply filter, if supplied
      if (json.since) {
        console.log('filtering')
        items = items.filter((item) => {
          return item.pubDate > json.since
        })
        console.log(items.length)
      }

      // response
      response = {
        ok: true,
        feed: items
      }

      // send response
      return new Response(JSON.stringify(response), okResponse)
    }
  }

  // everyone else gets a 400 response
  return new Response(notOk, notOkResponse)
}
