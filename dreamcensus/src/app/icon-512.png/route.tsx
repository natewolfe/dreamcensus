import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 320,
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

