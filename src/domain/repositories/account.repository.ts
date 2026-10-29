// src/domain/ports/account-repository.ts
import { Account } from '../account.entity'
import { EntityId } from '../vo/entity-id.vo'
import { AccountType } from '../enums'

export interface AccountRepository {
  findById(id: EntityId): Promise<Account | null>
  findByOwner(ownerId: string): Promise<Account[]>
  findByType(type: AccountType): Promise<Account[]>
  getAll(): Promise<Account[]>
  save(account: Account): Promise<void>
}
