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

  // parse the json
  const { searchParams } = new URL(context.request.url)
  const url = searchParams.get('url')
  if (!url) {
    return new Response(notOk, notOkResponse)
  }

  // if there's a id
  if (url) {
    const r = await fetch(url)
    const content = await r.text()
    const parsed = parser(content)
    if (parsed) {
      // send 302 response
      const redirectResponse = {
        status: 302,
        headers: {
          location: parsed
        }
      }
      return new Response('', redirectResponse)
    } else {
      // send 404 response
      return new Response(notOk, missingResponse)
    }
  }

  // everyone else gets a 400 response
  return new Response(notOk, notOkResponse)

}
