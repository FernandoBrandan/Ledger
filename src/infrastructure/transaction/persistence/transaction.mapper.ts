// src/infrastructure/transaction/persistence/entry.mapper.ts
import { TransactionStatus } from '../../../domain/enums'
import { Transaction } from '../../../domain/transaction.entity'

import { TransactionEntity } from './transaction.orm-entity'
import { EntryMapper } from './entry.mapper'
import { EntryEntity } from './entry.orm-entity'

export class TransactionMapper {
  static toDomain(orm: TransactionEntity): Transaction {
    return Transaction.reconstitute(
      orm.id,
      orm.reference,
      orm.status as TransactionStatus,
      orm.occurredAt,
      orm.createdAt,
      orm.postedAt,
      orm.entries.map((entryOrm: EntryEntity) => EntryMapper.toDomain(entryOrm)),
    )
  }

  static toPersistence(domain: Transaction): TransactionEntity {
    const orm = new TransactionEntity()
    orm.id = domain.id.value
    orm.reference = domain.reference
    orm.status = domain.status as string
    orm.occurredAt = domain.occurredAt
    orm.createdAt = domain.createdAt
    orm.postedAt = domain.postedAt ?? null
    orm.entries = domain.entries.map((entry) => EntryMapper.toPersistence(entry))
    return orm
  }
}
