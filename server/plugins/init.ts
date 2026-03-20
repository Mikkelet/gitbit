import fs from 'fs'
import { config } from '~/server/utils/config'

export default defineNitroPlugin(() => {
  fs.mkdirSync(config.repoRoot, { recursive: true })
  console.log(`gitbit running`)
  console.log(`Repositories stored in ${config.repoRoot}`)
})
