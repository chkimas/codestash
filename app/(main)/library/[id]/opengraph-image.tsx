import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const alt = 'Snippet Preview'
export const size = {
  width: 1200,
  height: 630
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()

  const { data: snippet, error } = await supabase
    .from('snippets')
    .select(
      `
      title,
      language,
      users!inner(name)
    `
    )
    .eq('id', id)
    .single()

  if (error || !snippet) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: '#09090b',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          CodeStash
        </div>
      )
    )
  }

  // Extract author name from joined data
  const authorName = Array.isArray(snippet.users)
    ? snippet.users[0]?.name
    : (snippet.users as { name?: string })?.name || 'Anonymous'

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
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            left: '-200px',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%'
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            zIndex: 10
          }}
        >
          <div
            style={{
              background: '#27272a',
              color: '#a1a1aa',
              padding: '10px 24px',
              borderRadius: '50px',
              fontSize: 24,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              border: '1px solid #3f3f46'
            }}
          >
            {snippet.language}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.1,
              maxWidth: '900px',
              marginTop: '20px'
            }}
          >
            {snippet.title}
          </div>

          {/* Author */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '40px',
              gap: '12px'
            }}
          >
            <div style={{ color: '#a1a1aa', fontSize: 30 }}>by</div>
            <div style={{ color: 'white', fontSize: 30, fontWeight: 600 }}>{authorName}</div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            fontSize: 24,
            color: '#52525b',
            letterSpacing: '1px'
          }}
        >
          CodeStash.
        </div>
      </div>
    ),
    {
      ...size
    }
  )
}
