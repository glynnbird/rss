import fxp from 'fast-xml-parser'
import { okResponse, notOkResponse, notOk } from './lib/constants.js'
import { mustBePOST, mustBeJSON, apiKey, handleCORS } from './lib/checks.js'

// our HTML/XML parser
const options = {
  ignoreAttributes: false,
  //preserveOrder: true,
  unpairedTags: ["hr", "br", "link", "meta"],
  stopNodes : [ "*.pre", "*.script"],
  processEntities: true,
  htmlEntities: true
}
const parser = new fxp.XMLParser(options)

export async function onRequest(context) {
  // handle POST/JSON/apikey chcecks
  const r = handleCORS(context.request) || apiKey(context.request, context.env) || mustBePOST(context.request) || mustBeJSON(context.request)
  if (r) return r

  // parse the json
  const json = await context.request.json()

  // if the mandatory fields are there
  if (json.url) {
    // fetch meta data for the supplied url
    // load the URL
    const r = await fetch(json.url)
    const content = await r.text()
    let p = parser.parse(content)

    // sometimes there's a !doctype layer above the html object
    // which we don't want
    if (p['!doctype']) {
      p = p['!doctype']
    }
    
    // this is the output object
    const obj = {}

    // map through all of the meta attributes
    p.html.head.meta.map((m) => {
      if (m['@_property'] === 'og:title') {
        obj.title = m['@_content']
      }
      if (m['@_property'] === 'og:description') {
        obj.description = m['@_content']
      }
      if (m['@_property'] === 'og:image') {
        obj.image = m['@_content']
      }
      if (m['@_property'] === 'twitter:image:src') {
        obj.image = m['@_content']
      }
      if (m['@_property'] === 'twitter:description') {
        obj.description = m['@_content']
      }
      if (m['@_property'] === 'twitter:title') {
        obj.title = m['@_content']
      }
    })
    
     // send response
     return new Response(JSON.stringify(obj), okResponse)
  }

  // everyone else gets a 400 response
  return new Response(notOk, notOkResponse)
}
