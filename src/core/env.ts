import { config as loadDotenv } from 'dotenv'

loadDotenv({ quiet: true })

export type RuntimeMode = 'dev' | 'prod'

export interface ServerEnv {
  mode: RuntimeMode
  host: string
  port: number
  publicUrl: string
  registryUrl?: string
  authToken?: string
  bundleFileLimit: number
  bundleTotalLimit: number
}

export function readServerEnv(): ServerEnv {
  const mode: RuntimeMode = process.env.SKILLFORGE_ENV === 'prod' ? 'prod' : 'dev'
  const port = Number.parseInt(process.env.SKILLFORGE_PORT ?? '8765', 10)
  const host = process.env.SKILLFORGE_HOST ?? (mode === 'prod' ? '0.0.0.0' : '127.0.0.1')
  const rawPublicUrl = process.env.SKILLFORGE_PUBLIC_URL ?? `http://localhost:${port}`
  const publicUrl = rawPublicUrl.replace(/\/+$/, '')
  const registryUrl = process.env.SKILLFORGE_REGISTRY_URL || undefined
  const authToken = process.env.SKILLFORGE_AUTH_TOKEN || undefined
  const bundleFileLimit = Number.parseInt(process.env.SKILLFORGE_BUNDLE_FILE_LIMIT ?? '49152', 10)
  const bundleTotalLimit = Number.parseInt(
    process.env.SKILLFORGE_BUNDLE_TOTAL_LIMIT ?? '262144',
    10
  )

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`SKILLFORGE_PORT must be a valid TCP port, got "${process.env.SKILLFORGE_PORT}"`)
  }

  return {
    mode,
    host,
    port,
    publicUrl,
    registryUrl,
    authToken,
    bundleFileLimit,
    bundleTotalLimit,
  }
}
