import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  // Maskable icons need extra padding (safe zone is ~80% of icon)
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 256,
          background: 'linear-gradient(135deg, #0c0e1a 0%, #1a1d2e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        🌙
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}

