import 'reflect-metadata'
import 'dotenv/config'
import { AppDataSource } from '../data-source'
import { seedAccounts } from '../seeders/seed-accounts'

async function run() {
  await AppDataSource.initialize()
  try {
    await seedAccounts(AppDataSource)
    console.log('✅ Seeders applied')
  } finally {
    await AppDataSource.destroy()
  }
}

run().catch((err) => {
  console.error('❌ Seeders failed', err)
  process.exit(1)
})
