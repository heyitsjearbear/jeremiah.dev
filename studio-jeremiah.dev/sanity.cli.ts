import {config as loadEnvConfig} from 'dotenv'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {defineCliConfig} from 'sanity/cli'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

loadEnvConfig({path: path.join(projectRoot, '.env.local'), override: true})
loadEnvConfig({path: path.join(projectRoot, '.env'), override: false})

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable.')
}

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
  },
})
