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
