import 'reflect-metadata'
import 'dotenv/config'
import { AppDataSource } from '../data-source'

// "db:migrate:revert": "ts-node -r tsconfig-paths/register src/shared/database/migrate-revert.ts"

async function run() {
  await AppDataSource.initialize()
  try {
    await AppDataSource.undoLastMigration()
    console.log('✅ Last migration reverted')
  } finally {
    await AppDataSource.destroy()
  }
}

run().catch((err) => {
  console.error('❌ Revert failed', err)
  process.exit(1)
})
