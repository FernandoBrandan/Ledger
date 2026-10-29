// pr_ledger/src/domain/entry.entity.ts
import { Money } from './vo/money.vo'
import { Currency } from './vo/currency.vo'
import { EntityId } from './vo/entity-id.vo'
import { EntryDirection } from './enums/index'
import { InvalidAmountError } from './errors/vo.errors'
import { EntryAlreadyLinkedError, EntryNotLinkedError } from './errors/transaction.errors'

export interface IEntry {
  readonly id: EntityId
  readonly accountId: EntityId
  readonly transactionId: EntityId
  readonly direction: EntryDirection
  readonly amount: Money
  readonly createdAt: Date
  isDebit(): boolean
  isCredit(): boolean
}

export interface CreateEntryProps {
  id: EntityId
  accountId: EntityId
  amount: Money
  createdAt?: Date
}

export class Entry implements IEntry {
  private constructor(
    public readonly id: EntityId,
    public readonly accountId: EntityId,
    private _transactionId: EntityId | undefined,
    public readonly direction: EntryDirection,
    public readonly amount: Money,
    public readonly createdAt: Date,
  ) {
    if (!amount.isPositive()) throw new InvalidAmountError()
  }

  static debit(props: CreateEntryProps): Entry {
    return new Entry(
      props.id,
      props.accountId,
      undefined,
      EntryDirection.DEBIT,
      props.amount,
      props.createdAt ?? new Date(),
    )
  }

  static credit(props: CreateEntryProps): Entry {
    return new Entry(
      props.id,
      props.accountId,
      undefined,
      EntryDirection.CREDIT,
      props.amount,
      props.createdAt ?? new Date(),
    )
  }

  static reconstitute(
    id: string,
    accountId: string,
    transactionId: string,
    direction: EntryDirection,
    amount: string | number,
    currency: string,
    createdAt: Date,
  ): Entry {
    return new Entry(
      EntityId.from(id),
      EntityId.from(accountId),
      EntityId.from(transactionId),
      direction,
      Money.of(amount, Currency.from(currency)),
      createdAt,
    )
  }

  get transactionId(): EntityId {
    if (!this._transactionId) throw new EntryNotLinkedError()
    return this._transactionId
  }

  /**
   * @internal Solo Transaction debe llamar a este método.
   * Es la forma de expresar composición: la Entry nace "huérfana"
   * y adquiere identidad de padre al entrar al aggregate.
   */
  linkTo(transactionId: EntityId): void {
    if (this._transactionId) throw new EntryAlreadyLinkedError()
    this._transactionId = transactionId
  }

  isDebit(): boolean {
    return this.direction === EntryDirection.DEBIT
  }

  isCredit(): boolean {
    return this.direction === EntryDirection.CREDIT
  }
}
