import {NextRequest, NextResponse} from 'next/server'

// Server-side proxy to the GRM Benin backend. The browser talks to this
// same-origin route, so we sidestep the backend's lack of CORS headers.
const BACKEND = process.env.GRM_BACKEND_URL || 'https://grm-web-app-benin.vercel.app'

export const dynamic = 'force-dynamic'

async function handler(req: NextRequest) {
  const search = req.nextUrl.search || ''
  // Derive the target path from the raw pathname (not the catch-all params)
  // so Django's required trailing slashes are preserved exactly.
  const targetPath = req.nextUrl.pathname.replace(/^\/api\/proxy\/?/, '')
  const url = `${BACKEND}/${targetPath}${search}`

  const headers = new Headers()
  const auth = req.headers.get('authorization')
  if (auth) headers.set('Authorization', auth)
  const contentType = req.headers.get('content-type')
  if (contentType) headers.set('Content-Type', contentType)
  headers.set('Accept', 'application/json')

  const method = req.method
  let body: BodyInit | undefined
  if (method !== 'GET' && method !== 'HEAD') {
    body = await req.arrayBuffer()
  }

  try {
    const upstream = await fetch(url, {
      method,
      headers,
      body,
      // Follow Django's trailing-slash redirects server-side so the browser
      // never sees a cross-origin redirect.
      redirect: 'follow',
    })

    const respContentType = upstream.headers.get('content-type') || ''
    const buf = await upstream.arrayBuffer()
    const res = new NextResponse(buf, {
      status: upstream.status,
      headers: {
        'content-type': respContentType || 'application/json',
      },
    })
    return res
  } catch (err) {
    return NextResponse.json(
      {error: 'proxy_error', detail: String(err)},
      {status: 502},
    )
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const OPTIONS = handler
