import { config as loadDotenv } from 'dotenv'

loadDotenv({ quiet: true })

export type RuntimeMode = 'dev' | 'prod'
