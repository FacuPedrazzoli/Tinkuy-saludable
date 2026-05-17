// Single source of truth for the `auth_user` cookie obfuscation.
//
// Previous code duplicated this in three files using ALGORITHM = 'aes-256-cbc',
// which is a Node.js cipher name the browser Web Crypto API does NOT accept
// (it only knows 'AES-CBC' / 'AES-GCM'), so encrypt() always threw on the
// client and the login flow silently died before redirecting. It also relied
// on `Buffer`, which is not guaranteed in the Next.js App Router client
// bundle. This module fixes both and keeps encrypt/decrypt provably in sync.

const IV_LENGTH = 16 // AES-CBC block/IV size in bytes
const COOKIE_SECRET =
  process.env.NEXT_PUBLIC_COOKIE_SECRET || 'default-fallback-secret-32bytes!!'

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return out
}

async function deriveKey(): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(COOKIE_SECRET),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('tinkuy-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-CBC', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptAuthCookie(text: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey()
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    new TextEncoder().encode(text),
  )
  return `${toHex(iv)}:${toHex(new Uint8Array(encrypted))}`
}

export async function decryptAuthCookie(
  encryptedData: string,
): Promise<string | null> {
  try {
    const [ivHex, cipherHex] = encryptedData.split(':')
    if (!ivHex || !cipherHex) return null
    const key = await deriveKey()
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: fromHex(ivHex) as BufferSource },
      key,
      fromHex(cipherHex) as BufferSource,
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}
