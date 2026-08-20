import { NextResponse } from "next/server"

/*
 * Spotify metadata for the track that plays on the "Off the clock" panel.
 *
 * Deliberately metadata only. Spotify's API does not hand out streamable
 * audio: the Web Playback SDK requires every listener to log in with a Premium
 * account, and the embed iframe exposes neither a volume control nor a seek
 * position. Neither can drive a visualiser either, since SDK audio is
 * DRM-protected and never reaches the Web Audio API. The audio itself is a
 * local file; this route supplies the cover art, the canonical title, and the
 * link back to Spotify.
 *
 * Uses the Client Credentials flow, so no visitor ever has to sign in. Set
 * SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to enable it; without them the
 * route returns the fallback below and the player works exactly the same.
 */

const QUERY = 'track:"Calling After Me" artist:"Wallows"'

const FALLBACK = {
  name: "Calling After Me",
  artist: "Wallows",
  album: null as string | null,
  art: null as string | null,
  url: "https://open.spotify.com/search/Calling%20After%20Me%20Wallows",
  source: "fallback" as const,
}

export const revalidate = 86400

async function getToken(id: string, secret: string) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    next: { revalidate: 3000 },
  })
  if (!res.ok) return null
  const json = (await res.json()) as { access_token?: string }
  return json.access_token ?? null
}

export async function GET() {
  const id = process.env.SPOTIFY_CLIENT_ID
  const secret = process.env.SPOTIFY_CLIENT_SECRET
  if (!id || !secret) return NextResponse.json(FALLBACK)

  try {
    const token = await getToken(id, secret)
    if (!token) return NextResponse.json(FALLBACK)

    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(QUERY)}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate } },
    )
    if (!res.ok) return NextResponse.json(FALLBACK)

    const json = await res.json()
    const track = json?.tracks?.items?.[0]
    if (!track) return NextResponse.json(FALLBACK)

    const images: { url: string; width: number }[] = track.album?.images ?? []
    // Smallest image that is still crisp at the size we render it.
    const art = images.slice().sort((a, b) => a.width - b.width).find((i) => i.width >= 160)

    return NextResponse.json({
      name: track.name as string,
      artist: (track.artists ?? []).map((a: { name: string }) => a.name).join(", "),
      album: (track.album?.name as string) ?? null,
      art: art?.url ?? images[0]?.url ?? null,
      url: track.external_urls?.spotify ?? FALLBACK.url,
      source: "spotify" as const,
    })
  } catch {
    return NextResponse.json(FALLBACK)
  }
}
