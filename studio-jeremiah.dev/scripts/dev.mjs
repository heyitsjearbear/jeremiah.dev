import {spawn} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {config as loadEnv} from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const studioRoot = path.resolve(__dirname, '..')
const projectRoot = path.resolve(studioRoot, '..')

loadEnv({path: path.join(projectRoot, '.env.local'), override: true})
loadEnv({path: path.join(projectRoot, '.env'), override: false})

if (!process.env.SANITY_STUDIO_PROJECT_ID) {
  process.env.SANITY_STUDIO_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
}

if (!process.env.SANITY_STUDIO_DATASET) {
  process.env.SANITY_STUDIO_DATASET =
    process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
}

if (!process.env.SANITY_STUDIO_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable.')
}

const child = spawn(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['exec', 'sanity', 'dev', '--', '--port', '3333'],
  {
  cwd: studioRoot,
    stdio: 'inherit',
  },
)

child.on('close', (code) => {
  process.exit(code ?? 0)
})
