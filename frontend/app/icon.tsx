import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#F0EFF4',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0C1618',
          fontWeight: 800,
          fontFamily: 'sans-serif',
          borderRadius: '4px',
        }}
      >
        H
      </div>
    ),
    { ...size }
  )
}
