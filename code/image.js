import { okResponse, missingResponse, notOkResponse, notOk } from './lib/constants.js'
import { mustBePOST, mustBeJSON, apiKey, handleCORS } from './lib/checks.js'

const parser = function(str) {
  // remove everything past the end head
  let i
  i = str.search('</head>')
  str = str.slice(0, i)
  // break into lines
  str = str.replace(/</g, '\n')
  str = str.replace(/\>/g, '\n')
  // only consider lines containing the twitter image
  const lines = str.split('\n').filter((l) => { return l.includes('name="twitter:image"') || l.includes('name="twitter:image:src"')})
  if (lines.length > 0) {
    const line = lines[0]
    str = line.replace(/.*content="/, '').replace(/".*/, '')
    return str
  }
  return str
}

export async function onRequest(context) {

  // handle POST/JSON/apikey chcecks
  const r = handleCORS(context.request) || apiKey(context.request, context.env) || mustBePOST(context.request) || mustBeJSON(context.request)
  if (r) return r

  // parse the json
  const json = await context.request.json()
  const url = json.url
  if (!url) {
    return new Response(notOk, notOkResponse)
  }

  // if there's a url
  const fr = await fetch(url)
  const content = await fr.text()
  const parsed = parser(content)
  if (parsed) {
    return new Response(okResponse, { url: parsed })
  } else {
    // send 404 response
    return new Response(notOk, missingResponse)
  }
}
