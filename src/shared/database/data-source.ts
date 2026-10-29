import 'reflect-metadata'
import 'dotenv/config'
import { DataSource } from 'typeorm'

import { AccountEntity } from '../../infrastructure/account/persistence/account.orm-entity'
import { TransactionEntity } from '../../infrastructure/transaction/persistence/transaction.orm-entity'
import { EntryEntity } from '../../infrastructure/transaction/persistence/entry.orm-entity'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'ledger',
  password: process.env.DB_PASSWORD ?? 'ledger',
  database: process.env.DB_NAME ?? 'pr_ledger',
  entities: [AccountEntity, TransactionEntity, EntryEntity],
  migrations: ['src/shared/database/migrations/*.ts'],
  synchronize: false,
  logging: ['error', 'warn'],
})
