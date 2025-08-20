import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

export interface Config {
  NEXT_PUBLIC_BASE_URL: string
}

export const configureEnv = (): Config => {
  const options = { path: path.join(__dirname, '../.env') }

  if (fs?.existsSync(options.path)) {
    dotenv.config(options)
  }
  if (process.env.NEXT_PUBLIC_BASE_URL == null) throw new Error('environment variable NEXT_PUBLIC_BASE_URL is required')

  return {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  }
}
