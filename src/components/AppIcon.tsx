import { useId } from 'react'

export function AppIcon({ className }: { className?: string }) {
  const gradientId = useId()

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill={`url(#${gradientId})`} />
      <path
        d="M6 16 C6 16, 11 9, 16 9 C21 9, 26 16, 26 16 C26 16, 21 23, 16 23 C11 23, 6 16, 6 16Z"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="4" fill="white" />
      <circle cx="16" cy="16" r="1.8" fill="#6366f1" />
    </svg>
  )
}
