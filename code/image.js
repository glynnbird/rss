import { okResponse, missingResponse, notOkResponse, notOk } from './lib/constants.js'
export async function onRequest(context) {
  
  const imageURL = 'https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/e1fb/live/befd0bb0-b5fe-11ef-a0f2-fd81ae5962f4.jpg.webp'
  const ACCOUNT_ID = context.env.CF_ACCOUNT_ID
  const TOKEN = context.env.CF_API_TOKEN
  const API_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`
  
  const image = await fetch(imageURL);
  const bytes = await image.bytes();
  
  const formData = new FormData();
  formData.append('file', new File([bytes], 'image.png'));
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: formData,
  })
  const j = await response.json()
  return new Response(JSON.stringify(j), okResponse)
}
