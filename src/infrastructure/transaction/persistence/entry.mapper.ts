// src/infrastructure/transaction/persistence/entry.mapper.ts
import { EntryDirection } from '../../../domain/enums'
import { Entry } from '../../../domain/entry.entity'
import { EntryEntity } from './entry.orm-entity'

export class EntryMapper {
  static toDomain(orm: EntryEntity): Entry {
    return Entry.reconstitute(
      orm.id,
      orm.accountId,
      orm.transactionId,
      orm.direction as EntryDirection,
      orm.amount,
      orm.currency,
      orm.createdAt,
    )
  }

  static toPersistence(domain: Entry): EntryEntity {
    const orm = new EntryEntity()
    orm.id = domain.id.value
    orm.transactionId = domain.transactionId.value
    orm.accountId = domain.accountId.value
    orm.amount = domain.amount.toDecimalString()
    orm.direction = domain.direction
    orm.currency = domain.amount.currency.code
    orm.createdAt = domain.createdAt
    return orm
  }
}
