import { NextResponse } from 'next/server'

export function apiSuccess(data?: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function apiError(message: string, status = 500, code?: string) {
  const body: { error: string; code?: string } = { error: message }
  if (code) body.code = code
  return NextResponse.json(body, { status })
}