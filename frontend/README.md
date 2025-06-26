# Front end

The Nuxt app that provides the web UI for this project. This is a static website that relies on a Cloudflare-hosted API
which stores its state in Cloudflare KV. In production, the API is served out from `/api/*` on the same domain as the
front end, but in development, the API must exist somewhere else.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

## Config

Define which API we're going to use. Create a `.env` file here containing:

```
NUXT_PUBLIC_API_BASE=https://some.domain.com
```

and the app will assume there's an API living at `/api` at that domain name.

## Development Server

Start the development server on `http://localhost:3000`

```bash
npm run dev
```
