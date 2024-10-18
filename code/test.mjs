import fxp from 'fast-xml-parser'
import crypto from 'crypto'
const options = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
}
console.log(fxp)
process.exit()
const parser = new fxp.XMLParser(options)
const hash = (str) => {
  return crypto.createHash('md5').update(str).digest('hex')
}

const main = async () => {
  const r = await fetch('https://www.theguardian.com/uk-news/rss')
  const str = await r.text()
  const obj = parser.parse(str)
  delete obj.rss.channel.item
  console.log(JSON.stringify(obj.rss.channel, null, '  '))

  process.exit()
  const items = obj.rss.channel.item.map((i) => {
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
    delete i.category
    delete i['content:encoded']
    return i
  })
  console.log(JSON.stringify(items))
}
main()
