import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set("academy_preview", "true", {
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours
    httpOnly: false,
    sameSite: "lax",
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete("academy_preview")
  return res
}
