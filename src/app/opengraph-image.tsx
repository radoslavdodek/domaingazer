import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Domain Gazer — AI Domain Name Finder'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '0 80px',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: -300,
            left: '50%',
            width: 900,
            height: 900,
            borderRadius: '50%',
            background: 'rgba(37, 99, 235, 0.15)',
            filter: 'blur(120px)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 28,
            padding: '10px 24px',
            borderRadius: 999,
            border: '1px solid rgba(59, 130, 246, 0.35)',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#93c5fd',
            fontSize: 20,
          }}
        >
          Powered by AI
        </div>

        {/* Main heading */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: 68,
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: 1.1,
            color: '#ffffff',
            marginBottom: 32,
          }}
        >
          <div>Find your perfect</div>
          <div style={{ color: '#60a5fa' }}>domain name</div>
          <div>instantly</div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: '#a1a1aa',
            textAlign: 'center',
            marginBottom: 60,
          }}
        >
          AI-powered generation | Real-time availability | Multiple TLDs
        </div>

        {/* TLD pills */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 96 }}>
          {['.com', '.io', '.ai', '.net', '.shop', '.store'].map((tld) => (
            <div
              key={tld}
              style={{
                padding: '12px 22px',
                borderRadius: 10,
                border: '1px solid rgba(113, 113, 122, 0.45)',
                background: 'rgba(39, 39, 42, 0.7)',
                color: '#a1a1aa',
                fontSize: 24,
              }}
            >
              {tld}
            </div>
          ))}
        </div>

        {/* Site URL bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            color: '#52525b',
            fontSize: 20,
          }}
        >
          domaingazer.com
        </div>
      </div>
    ),
    { ...size },
  )
}
