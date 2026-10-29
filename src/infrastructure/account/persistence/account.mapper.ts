import { AccountType, AccountStatus } from '../../../domain/enums'
import { Account } from '../../../domain/account.entity'
import { AccountEntity } from './account.orm-entity'

export class AccountMapper {
  static toDomain(orm: AccountEntity): Account {
    return Account.reconstitute(
      orm.id,
      orm.ownerId,
      orm.type as AccountType,
      orm.currency,
      orm.parentAccountId,
      orm.createdAt,
      orm.balance,
      orm.status as AccountStatus,
    )
  }

  static toPersistence(domain: Account): Partial<AccountEntity> {
    const orm = new AccountEntity()

    orm.id = domain.id.value
    orm.ownerId = domain.ownerId
    orm.type = domain.type as string
    orm.balance = domain.balance.amount.toString()
    orm.currency = domain.currency.code
    orm.parentAccountId = domain.parentAccountId?.value ?? null
    orm.status = domain.status as string
    orm.createdAt = domain.createdAt
    
    return orm
  }
}
