# GRM Citizen — Web Demo

A web replica of the **grm-citizen-app** mobile application, built so it can be
shared as a clickable demo without installing anything. The app renders inside a
phone frame on desktop browsers (and full-screen on real phones) so it feels
like a native mobile app.

It connects to the live **GRM Web App (Benin)** Django backend deployed on
Vercel: `https://grm-web-app-benin.vercel.app`.

## How it works

- **Next.js (App Router) + TypeScript + Tailwind CSS**, deployed on Vercel.
- All backend calls go through a same-origin server proxy at
  `/api/proxy/[...path]` (`src/app/api/proxy/[...path]/route.ts`). The Benin
  backend does not send CORS headers, so the browser talks to this proxy and the
  proxy forwards the request server-side. Django's required trailing slashes are
  preserved.
- Token auth: the citizen logs in via `/authentication/login/`, and the returned
  token is stored in `localStorage` and sent as `Authorization: Token <token>`.

## Features (mirrors the native app)

- Login & registration
- Home dashboard with the citizen's grievances
- All cases list
- Case detail: status, description, attachments, comments (add comment), rating
- Multi-step "report a new grievance" flow (confidentiality → details →
  location → summary) that submits a real issue to the backend
- Profile
- French / English (defaults to French, like the native app)

## Demo credentials

- Username: `demo`
- Password: `demo`

## Local development

```bash
npm install
npm run dev
# http://localhost:3000
```

### Environment

- `GRM_BACKEND_URL` (optional) — backend origin the proxy forwards to. Defaults
  to `https://grm-web-app-benin.vercel.app`.
