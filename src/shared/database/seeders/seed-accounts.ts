import { DataSource } from 'typeorm'
import { AccountEntity } from '../../../infrastructure/account/persistence/account.orm-entity'

export async function seedAccounts(ds: DataSource) {
  const repo = ds.getRepository(AccountEntity)

  const existing = await repo.count()
  if (existing > 0) {
    console.log('⏭️  Accounts already seeded, skipping')
    return
  }

  await repo.save([
    repo.create({
      id: '00000000-0000-0000-0000-000000000001',
      ownerId: 'demo-owner',
      type: 'ASSET',
      balance: '0',
      currency: 'USD',
      parentAccountId: null,
      status: 'ACTIVE',
      createdAt: new Date(),
    }),
    // ...
  ])

  console.log('🌱 Accounts seeded')
}
