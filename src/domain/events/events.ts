import { AccountType } from '../enums/index'
import { EntityId } from '../vo/entity-id.vo'

export class TransactionPosted {
  constructor(
    public readonly transactionId: EntityId,
    public readonly affectedAccountIds: EntityId[],
    public readonly postedAt: Date,
  ) {}
}

export class TransactionVoided {
  constructor(
    public readonly transactionId: EntityId,
    public readonly reason: string,
  ) {}
}

export class AccountCreated {
  constructor(
    public readonly accountId: EntityId,
    public readonly type: AccountType,
  ) {}
}
