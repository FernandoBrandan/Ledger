import 'reflect-metadata'
import 'dotenv/config'
import { AppDataSource } from '../data-source'

// "db:migrate": "ts-node -r tsconfig-paths/register src/shared/database/migrate.ts",

async function run() {
  await AppDataSource.initialize()
  try {
    await AppDataSource.runMigrations()
    console.log('✅ Migrations applied')
  } finally {
    await AppDataSource.destroy()
  }
}

run().catch((err) => {
  console.error('❌ Migration failed', err)
  process.exit(1)
})
