import { ImageResponse } from 'next/og'
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog'

export const runtime = 'edge'
export const alt = 'Domain Gazer Blog'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({
    slug: post.slug,
  }))
}

export default function OGImage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug)

  const title = post?.title ?? 'Domain Gazer Blog'
  const category = post?.category ?? 'Blog'
  const readTime = post?.readTime ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 80px',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -100,
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'rgba(6, 182, 212, 0.12)',
            filter: 'blur(120px)',
          }}
        />

        {/* Category badge + read time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              padding: '8px 20px',
              borderRadius: 999,
              border: '1px solid rgba(6, 182, 212, 0.4)',
              background: 'rgba(6, 182, 212, 0.1)',
              color: '#67e8f9',
              fontSize: 18,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {category}
          </div>
          {readTime && (
            <div style={{ color: '#71717a', fontSize: 18 }}>{readTime}</div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            lineHeight: 1.15,
            color: '#ffffff',
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 44,
            left: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#52525b',
            fontSize: 20,
          }}
        >
          domaingazer.com/blog
        </div>
      </div>
    ),
    { ...size },
  )
}
