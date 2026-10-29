// src/domain/ports/transaction-repository.ts
import { Transaction } from '../transaction.entity'
import { EntityId } from '../vo/entity-id.vo'

export interface TransactionRepository {
  findById(id: EntityId): Promise<Transaction | null>
  save(transaction: Transaction): Promise<void>
  // findByAccountId()
  // findByReference()
}
