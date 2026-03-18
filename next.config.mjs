import { execSync } from 'child_process'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const commitId = (() => { try { return execSync('git rev-parse --short HEAD').toString().trim() } catch { return 'unknown' } })()
const commitDate = (() => { try { return execSync('git log -1 --format=%ci').toString().trim() } catch { return 'unknown' } })()
const projectRoot = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_COMMIT_ID: commitId,
    NEXT_PUBLIC_APP_COMMIT_DATE: commitDate,
  },
  turbopack: {
    root: projectRoot,
  },
  serverExternalPackages: ['@aws-sdk/client-route-53-domains'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms",
              "style-src 'self' 'unsafe-inline' https://accounts.google.com",
              "img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://www.clarity.ms https://*.supabase.co",
              "font-src 'self' data: https://accounts.google.com",
              "frame-src https://accounts.google.com https://demo.arcade.software https://*.arcade.software",
              "connect-src 'self' https://accounts.google.com https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.googletagmanager.com https://www.clarity.ms https://*.clarity.ms",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
}

export default nextConfig
