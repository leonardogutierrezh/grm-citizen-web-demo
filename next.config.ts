import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  // The Django backend is strict about trailing slashes. Don't let Next.js
  // issue its own trailing-slash redirects on the proxy route.
  skipTrailingSlashRedirect: true,
}

export default nextConfig
